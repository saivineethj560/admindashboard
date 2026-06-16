import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Check,
  X,
  Undo2,
} from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
// import { API_BASE_URL_INDENT, API_DOC_URL_INDENT } from "./Config";
import { API_BASE_URL_INDENT, API_DOC_URL_INDENT } from "../Config";
// import { useIndent } from "./context/IndentContext";

// Configure axios
axios.defaults.baseURL = API_BASE_URL_INDENT;

// Add token automatically to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const IndentApproval = ({ mainType, tileType, subTab }) => {
  const { case_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isViewMode = location.state?.viewMode || false;
  const inboxCaseData = location.state?.caseData || null;

  // State management
  const [indent, setIndent] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [uploads, setUploads] = useState([
    { id: Date.now(), file: null, fileName: null },
  ]);

  const [documents, setDocuments] = useState([]);

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [comments, setComments] = useState(""); // added on 14-11-2025 by rajakumari.m
  const [showRevertButton, setShowRevertButton] = useState(false); // added on 14-11-2025 by rajakumari.m
  // Get user data from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const username = storedUser?.username || "";
  const displayName = storedUser?.name || "";
  const email = storedUser?.email || "";
  // const { selectedIndent } = useIndent();

  // const case_id = selectedIndent?.case_id;

  // console.log("selectedIndent:", selectedIndent);

  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  console.log("case_id-", case_id);
  console.log("userToken-", userToken);
  console.log("userToken-", userToken.username);

  // added on 14-11-2025 by rajakumari.m
  useEffect(() => {
    const revertEnabledTasks = [
      "PLANNING_QS",
      "PRESIDENT_PRJ",
      "PRESIDENT",
      "DIRECTOR_PRJ",
    ];
    setShowRevertButton(revertEnabledTasks.includes(indent?.CUR_TASK));
  }, [indent?.CUR_TASK]);
  //-----------------------------------------end------------------------------------------------------------

  
  // Fetch indent details
  useEffect(() => {
    const fetchIndentDetails = async () => {
      if (!case_id) return;

      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL_INDENT}/indent-details/${case_id}`);
        const responseData = res.data.data;

        console.log("API Response:", responseData);

        // ✅ if data comes only as line_items (no approval object)
        const lineItems = responseData.line_items || [];
        console.log("lineitems-", lineItems);
        // ✅ Extract top-level fields from the first line item (if available)
        const topFields =
          lineItems.length > 0
            ? {
                // SNO: lineItems[0].SNO || "",
                case_id: lineItems[0].case_id || "",
                EMP_ID: lineItems[0].EMPID || "",
                RAISER: lineItems[0].EMP_NAME || "",
                EMP_MAIL: lineItems[0].EMP_MAILID || "",
                DEPT: lineItems[0].DEPT || "",
                PLANT: lineItems[0].PLANT || "",
                PRJ_TYPE: lineItems[0].PRJ_TYPE || "",
                RAISER_DATE: lineItems[0].RAISER_DATE || "",
                CUR_TASK: lineItems[0].CUR_TASK || "",
                // DOC_PATHS: lineItems[0].DOC_PATHS || ""
              }
            : {};

        // ✅ Save indent with top fields and line items
        setIndent({
          ...topFields,
          line_items: lineItems,
        });

        // ✅ Set items array for the table
        setItems(
          lineItems.map((item) => ({
            SNO: item.SNO || "",
            wbs: item.WBS_ELE || "",
            subwbs: item.SUBWBS_ELE || "",
            mat_code: item.MAT_CODE || "",
            mat_desc: item.MAT_DESC || "",
            uom: item.UOM || "",
            quantity: item.QUAN || "",
            till_indent: item.TILL_INDENT || "",
            reqnow: item.REQ_NOW || "",
            balqty: (
              parseFloat(item.QUAN || 0) - parseFloat(item.TILL_INDENT || 0)
            ).toString(),
            Remarks: item.REMARKS || "",
          }))
        );

        // ✅ Parse DOC_PATHS and DOC_NAMES (if exist)
        if (lineItems.length > 0) {
          const firstItem = lineItems[0];
          const docPaths = firstItem.DOC_PATHS
            ? JSON.parse(firstItem.DOC_PATHS)
            : [];
          const docNames = firstItem.DOC_NAMES
            ? JSON.parse(firstItem.DOC_NAMES)
            : [];

          // 🔗 Combine into an array of { name, path } objects
          const combinedDocs = docPaths.map((path, idx) => ({
            name: docNames[idx] || path.split("/").pop(), // fallback to filename if missing
            path: path,
          }));

          setDocuments(combinedDocs);
          console.log("📂 Combined Docs:", combinedDocs);
        } else {
          setDocuments([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching indent details:", err);
        setNotification({
          show: true,
          type: "error",
          message: "Failed to load indent details",
        });
        setTimeout(
          () => setNotification({ show: false, type: "", message: "" }),
          3000
        );
        setLoading(false);
      }
    };

    fetchIndentDetails();
  }, [case_id]);

  // Handle checkbox selection
  const handleCheckboxChange = (index) => {
    setSelectedItems((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  // Handle select all
  const handleSelectAll = () => {
    if (isViewMode) return;

    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  // Update selectAll state when items change
  useEffect(() => {
    if (items.length > 0 && selectedItems.length === items.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, items]);

  // Handle approve action
  const handleApprove = async () => {
    if (selectedItems.length === 0) {
      setNotification({
        show: true,
        type: "error",
        message: "Please select at least one item to approve",
      });
      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000
      );
      return;
    }

    setLoading(true);
    try {
      // ✅ Separate selected and unselected items
      const selected = items.filter((_, index) =>
        selectedItems.includes(index)
      );
      const unselected = items.filter(
        (_, index) => !selectedItems.includes(index)
      );
      // Prepare approval data
      const approvalData = {
        // SNO:indent.SNO,
        case_id: case_id,
        CUR_TASK: indent.CUR_TASK,
        PLANT: indent.PLANT,
        RAISER: indent.RAISER,
        action: "approve",
        selectedItems: selectedItems,
        // items: items.filter((_, index) => selectedItems.includes(index)),
        selectedItemsData: selected, // ✅ Send selected item details
        unselectedItemsData: unselected, // ✅ Send unselected item details
        user: {
          username: userToken.username,
          displayName: userToken.employee,
          email: userToken.Email,
        },
      };

      // 🔹 Log approval data before sending
      console.log("Sending approval data to API:", approvalData);

      // ✅ Choose API endpoint dynamically based on current task
      let apiEndpoint = "";

      switch (indent.CUR_TASK) {
        case "PM":
          apiEndpoint = `${API_BASE_URL_INDENT}/indent-approval-pm`;
          break;
        case "PLANNING_QS":
          apiEndpoint = `${API_BASE_URL_INDENT}/indent-approval-planningqs`;
          break;
        case "PRJ_INCHARGE":
          apiEndpoint = `${API_BASE_URL_INDENT}/indent-approval-prjincharge`;
          break;
        case "PRJ_HEAD":
          apiEndpoint = `${API_BASE_URL_INDENT}/indent-approval-prjhead`;
          break;
        case "PRESIDENT_PRJ":
          apiEndpoint = `${API_BASE_URL_INDENT}/indent-approval-presprj`;
          break;
        case "PRESIDENT":
          apiEndpoint = `${API_BASE_URL_INDENT}/indent-approval-pres`;
          break;
        case "DIRECTOR_PRJ":
          apiEndpoint = `${API_BASE_URL_INDENT}/indent-approval-directorprj`;
          break;
        default:
          apiEndpoint = `${API_BASE_URL_INDENT}/indent-approval`; // fallback
          console.warn("⚠️ Unknown CUR_TASK, using default approval endpoint.");
          break;
      }

      // ✅ Send API request
      const response = await axios.post(apiEndpoint, approvalData);

      console.log("✅ API Response:", response.data);

      setNotification({
        show: true,
        type: "success",
        message: `Approved ${selectedItems.length} item(s) successfully`,
      });

      // Reset selection after approval
      setSelectedItems([]);

      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error("Error during approval:", error);
      setNotification({
        show: true,
        type: "error",
        message: "Failed to approve items",
      });
      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel/reject action
  const handleCancel = async () => {
    if (selectedItems.length === 0) {
      setNotification({
        show: true,
        type: "error",
        message: "Please select at least one item to reject",
      });
      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000
      );
      return;
    }

    setLoading(true);
    try {
      // Prepare rejection data
      const rejectionData = {
        case_id: case_id,
        CUR_TASK: indent.CUR_TASK,
        PLANT: indent.PLANT,
        RAISER: indent.RAISER,
        action: "reject",
        selectedItems: selectedItems,
        items: items.filter((_, index) => selectedItems.includes(index)),
        user: {
          username: username,
          displayName: displayName,
          email: email,
        },
      };

      console.log("Sending approval data to API:", rejectionData);

      // Make API call for rejection
      const response = await axios.post(
        `${API_BASE_URL_INDENT}/indent-rejection`,
        rejectionData
      );

      setNotification({
        show: true,
        type: "error",
        message: `Rejected ${selectedItems.length} item(s)`,
      });

      // Reset selection after rejection
      setSelectedItems([]);

      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error("Error during rejection:", error);
      setNotification({
        show: true,
        type: "error",
        message: "Failed to reject items",
      });
      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000
      );
    } finally {
      setLoading(false);
    }
  };

  //---------------------------------------------------------------------------------start-----------------------------
  // added on 14-11-2025 by rajakumari.m
  const handleRevert = async () => {
    if (selectedItems.length === 0) {
      setNotification({
        show: true,
        type: "error",
        message: "Please select at least one item to revert",
      });
      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000
      );
      return;
    }

    setLoading(true);
    try {
      const selected = items.filter((_, index) =>
        selectedItems.includes(index)
      );
      const unselected = items.filter(
        (_, index) => !selectedItems.includes(index)
      );

      const revertData = {
        case_id: case_id,
        CUR_TASK: indent.CUR_TASK,
        PLANT: indent.PLANT,
        RAISER: indent.RAISER,
        RAISER_MAIL: indent.EMP_MAIL,
        action: "revert",
        selectedItems: selectedItems,
        selectedItemsData: selected,
        unselectedItemsData: unselected,
        comments: comments,
        user: {
          username: username,
          displayName: displayName,
          email: email,
        },
      };

      console.log("Sending revert data to API:", revertData);

      let apiEndpoint = "";
      // switch (indent.CUR_TASK) {
      //   case "PLANNING_QS":
      //     apiEndpoint = `${API_BASE_URL_INDENT}/indent-revert-planningqs`;
      //     break;
      //   case "PRESIDENT_PRJ":
      //     apiEndpoint = `${API_BASE_URL_INDENT}/indent-revert-presprj`;
      //     break;
      //   case "PRESIDENT":
      //     apiEndpoint = `${API_BASE_URL_INDENT}/indent-revert-pres`;
      //     break;
      //   case "DIRECTOR_PRJ":
      //     apiEndpoint = `${API_BASE_URL_INDENT}/indent-revert-directorprj`;
      //     break;
      //   default:
      //     apiEndpoint = `${API_BASE_URL_INDENT}/indent-revert`;
      //     break;
      // }

      apiEndpoint = `${API_BASE_URL_INDENT}/indent-revert`;
      const response = await axios.post(apiEndpoint, revertData);

      console.log("✅ Revert Response:", response.data);

      setNotification({
        show: true,
        type: "success",
        message: `Reverted ${selectedItems.length} item(s) successfully`,
      });

      setSelectedItems([]);
      setComments("");

      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error("Error during revert:", error);
      setNotification({
        show: true,
        type: "error",
        message: "Failed to revert items",
      });
      setTimeout(
        () => setNotification({ show: false, type: "", message: "" }),
        3000
      );
    } finally {
      setLoading(false);
    }
  };
  // File upload handlers

  const colorScheme = mainType === "Material" ? "green" : "blue";
  const primaryColor = "#28556e";
  const lightBorder = "#7ba5b8";

  if (loading) {
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
          className={`fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-lg shadow-lg transition-all ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header with Title and Back Button */}
      <div className="mt-1 mb-2 px-4 py-1.5 bg-[#28556E] border border-[#28556E] rounded-md shadow-sm flex items-center justify-between">
        <h1 className="flex-1 text-lg font-semibold tracking-wide text-center text-white">
          Approval Form
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-[#28556E] rounded-md hover:bg-[#f1f5f9] transition-all border border-[#28556E] bg-white absolute right-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <form
        // onSubmit={handleSubmit}
        className="mb-1 overflow-hidden bg-white border-2 shadow-lg rounded-xl"
        style={{ borderColor: primaryColor }}
      >
        <div className="p-2 space-y-2">
          {/* Two Column Layout */}
          <div className="flex gap-1.5">
            {/* Left Section - Form Fields */}
            <div
              className="flex-1 p-2 border-2 rounded-lg"
              style={{ borderColor: lightBorder }}
            >
              {/* User Information Section */}
              <div className="grid grid-cols-1 gap-2 mb-2 md:grid-cols-4">
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-1">
                    Case ID<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={indent.case_id || case_id || ""}
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
                    Raiser Emp ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={indent?.EMP_ID || ""}
                    readOnly
                    className="w-full px-3 py-1.5 text-[14px] rounded bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                    style={{
                      border: `1px solid ${lightBorder}`,
                      height: "32px",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-1">
                    Raiser Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={indent?.RAISER || ""}
                    readOnly
                    className="w-full px-3 py-1.5 text-[14px] rounded bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                    style={{
                      border: `1px solid ${lightBorder}`,
                      height: "32px",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-gray-700 mb-1">
                    Raiser Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={indent?.EMP_MAIL || ""}
                    readOnly
                    className="w-full px-3 py-1.5 text-[14px] rounded bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                    style={{
                      border: `1px solid ${lightBorder}`,
                      height: "32px",
                    }}
                  />
                </div>
              </div>

              {/* Plant & Project Type Section */}
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
                    readOnly={isViewMode}
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
                    readOnly={isViewMode}
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
                      indent?.RAISER_DATE // here date is display as 2025-11-10 05:45:00.000000: formate or display null if date not exists
                        ? new Date(indent.RAISER_DATE)
                            .toISOString() // here the formate taken into string as "2025-11-10T00:00:00.000Z"
                            .slice(0, 10) // here that string as cut(slice) into 0-10 chars
                            .split("-") // then split into array formate like this:["2025", "11", "10"]
                            .reverse() //then reverse it ["10", "11", "2025"]
                            .join("-") // and join as 10-11-2025 converts yyyy-mm-dd → dd-mm-yyyy
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

            {/* Right Section - Upload */}
            {/* <div className="col-md-4" style={{ borderColor: lightBorder }}> */}
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
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <a
                        href={`${API_DOC_URL_INDENT}/${doc.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {doc.name}
                      </a>
                      <i className="bi bi-file-earmark-text text-secondary"></i>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">
                  No documents uploaded for this indent.
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mt-[-4]">
            <div
              className="overflow-x-auto border-2 rounded-lg shadow-sm"
              style={{ borderColor: lightBorder }}
            >
              <table className="w-full border-collapse min-w-max">
                <thead>
                  <tr className="bg-gray-200">
                    <th
                      className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </th>

                    <th
                      className="px-0.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      Sno
                    </th>
                    <th
                      className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      WBS Element
                    </th>
                    <th
                      className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      Sub WBS
                    </th>

                    <th
                      className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      Material Group
                    </th>
                    <th
                      className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      Material Code
                    </th>
                    <th
                      className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      Material Desc
                    </th>
                    <th
                      className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      Total Qty
                    </th>
                    <th
                      className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      UOM
                    </th>
                    <th
                      className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      Till Indent
                    </th>
                    <th
                      className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      Balance Qty
                    </th>
                    <th
                      className="px-1.5 py-1 text-left text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      Req Now
                    </th>
                    <th
                      className="px-1.5 py-1 text-center text-[12px] font-semibold text-gray-700 border-b-2 whitespace-nowrap"
                      style={{ borderColor: lightBorder }}
                    >
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="px-4 py-8 text-sm text-center text-gray-500"
                      >
                        No line items found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedItems.includes(index) ? "bg-blue-50" : ""
                        }`}
                      >
                        <td
                          className="px-1.5 py-0.5 border-b text-center"
                          style={{ borderColor: lightBorder }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(index)}
                            onChange={() => handleCheckboxChange(index)}
                            className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                        <td
                          className="px-1.5 py-0.5 border-b text-center text-[11px]"
                          style={{ borderColor: lightBorder }}
                        >
                          {index + 1}
                        </td>
                        <td
                          className="px-1.5 py-0.5 border-b"
                          style={{ borderColor: lightBorder }}
                        >
                          <input
                            type="text"
                            value={item.wbs || ""}
                            disabled={isViewMode}
                            className="w-32 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100"
                            style={{
                              border: `1px solid ${lightBorder}`,
                              height: "26px",
                            }}
                          />
                        </td>
                        <td
                          className="px-1.5 py-0.5 border-b"
                          style={{ borderColor: lightBorder }}
                        >
                          <input
                            type="text"
                            value={item.subwbs || ""}
                            disabled={isViewMode}
                            className="w-32 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100"
                            style={{
                              border: `1px solid ${lightBorder}`,
                              height: "26px",
                            }}
                          />
                        </td>
                        <td
                          className="px-1.5 py-0.5 border-b"
                          style={{ borderColor: lightBorder }}
                        >
                          <input
                            type="text"
                            value={item.mat_group || ""}
                            disabled={isViewMode}
                            className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100"
                            style={{
                              border: `1px solid ${lightBorder}`,
                              height: "26px",
                            }}
                          />
                        </td>
                        <td
                          className="px-1.5 py-0.5 border-b"
                          style={{ borderColor: lightBorder }}
                        >
                          <input
                            type="text"
                            value={item.mat_code || ""}
                            disabled={isViewMode}
                            className="w-28 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100"
                            style={{
                              border: `1px solid ${lightBorder}`,
                              height: "26px",
                            }}
                          />
                        </td>
                        <td
                          className="px-1.5 py-0.5 border-b"
                          style={{ borderColor: lightBorder }}
                        >
                          <input
                            type="text"
                            value={item.mat_desc || ""}
                            readOnly
                            className="w-32 px-1.5 py-1 text-[11px] bg-gray-50 rounded cursor-not-allowed"
                            style={{
                              border: `1px solid ${lightBorder}`,
                              height: "26px",
                            }}
                          />
                        </td>
                        <td
                          className="px-1.5 py-0.5 border-b"
                          style={{ borderColor: lightBorder }}
                        >
                          <input
                            type="text"
                            value={item.quantity || ""}
                            readOnly
                            className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded cursor-not-allowed"
                            style={{
                              border: `1px solid ${lightBorder}`,
                              height: "26px",
                            }}
                          />
                        </td>
                        <td
                          className="px-1.5 py-0.5 border-b"
                          style={{ borderColor: lightBorder }}
                        >
                          <input
                            type="text"
                            value={item.uom || ""}
                            readOnly
                            className="w-16 px-1.5 py-1 text-[11px] bg-gray-50 rounded cursor-not-allowed"
                            style={{
                              border: `1px solid ${lightBorder}`,
                              height: "26px",
                            }}
                          />
                        </td>
                        <td
                          className="px-1.5 py-0.5 border-b"
                          style={{ borderColor: lightBorder }}
                        >
                          <input
                            type="text"
                            value={item.till_indent || ""}
                            readOnly
                            className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded cursor-not-allowed"
                            style={{
                              border: `1px solid ${lightBorder}`,
                              height: "26px",
                            }}
                          />
                        </td>
                        <td
                          className="px-1.5 py-0.5 border-b"
                          style={{ borderColor: lightBorder }}
                        >
                          <input
                            type="text"
                            value={item.balqty || ""}
                            readOnly
                            className="w-20 px-1.5 py-1 text-[11px] bg-gray-50 rounded cursor-not-allowed"
                            style={{
                              border: `1px solid ${lightBorder}`,
                              height: "26px",
                            }}
                          />
                        </td>
                        <td
                          className="px-1.5 py-0.5 border-b"
                          style={{ borderColor: lightBorder }}
                        >
                          <input
                            type="number"
                            value={item.reqnow || ""}
                            disabled={isViewMode}
                            className="w-24 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100"
                            style={{
                              border: `1px solid ${lightBorder}`,
                              height: "26px",
                            }}
                          />
                        </td>
                        <td
                          className="px-1.5 py-0.5 border-b"
                          style={{ borderColor: lightBorder }}
                        >
                          <input
                            type="text"
                            value={item.Remarks || ""}
                            disabled={isViewMode}
                            className="w-24 px-1.5 py-1 text-[11px] rounded focus:outline-none disabled:bg-gray-100"
                            style={{
                              border: `1px solid ${lightBorder}`,
                              height: "26px",
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 p-3 mt-2 mb-2 rounded-lg bg-gray-50 ">
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-1">
                Comments<span className="text-red-500">*</span>
              </label>
              <textarea
                type="text"
                name="name"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-60 px-2 py-1 text-[11px] bg-white rounded"
                style={{ border: `1px solid ${lightBorder}`, height: "40px" }}
                placeholder="Enter your comments here..."
              />
            </div>
          </div>
          {/* Submit Buttons */}
          {/* {isViewMode && ( */}

          <div className="flex items-center justify-center gap-4 p-3 mt-2 mb-2 rounded-lg bg-gray-50 ">

               {/* added by 14-11-2025 by rajakumari.m */}
                        {/* Revert Button - Only show for specific tasks */}
              {/* {showRevertButton && ( */}
                <button
                  type="button"
                  onClick={handleRevert}
                  disabled={loading || selectedItems.length === 0}
                  className="flex items-center gap-1.5 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-orange-600"
                >
                  <Undo2  className="w-4 h-4" />
                  Revert Selected
                </button>
              {/* )} */}
              {/* ---------------------end---------------------------------------- */}
            <button
              type="button"
              onClick={handleApprove}
              disabled={loading || selectedItems.length === 0}
              className="flex items-center gap-1.5 px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-600"
            >
              <Check className="w-4 h-4" />
              Approve Selected
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading || selectedItems.length === 0}
              className="flex items-center gap-1.5 px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-600"
            >
              <X className="w-4 h-4" />
              Reject Selected
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default IndentApproval;
