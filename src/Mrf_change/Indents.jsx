
// //===========================06-04-2026====================================

// import { useState, useEffect, useRef } from "react";
// import { API_BASE_URL } from "../Config";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";

// // ─── FLOW CONFIG ──────────────────────────────────────────────────────────────
// const FLOW_STEPS = {
//   PROJECTS: [
//     { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
//     { key: "PLANNING_QS", label: "Planning & QS", icon: "👤", color: "#f59e0b" },
//     { key: "PRJ_INCHARGE", label: "Prj. Incharge", icon: "👤", color: "#ef4444" },
//     { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#ec4899" },
//     { key: "PRESIDENT_PRJ", label: "President (Prj)", icon: "👤", color: "#6366f1" },
//     { key: "DIRECTOR_PRJ", label: "Director", icon: "👤", color: "#10b981" },
//   ],
//   RMC: [
//     { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
//     { key: "PLANNING_QS", label: "Planning & QS", icon: "👤", color: "#f59e0b" },
//     { key: "PRJ_INCHARGE", label: "Prj. Incharge", icon: "👤", color: "#ef4444" },
//     { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#ec4899" },
//     { key: "PRESIDENT_PRJ", label: "President (Prj)", icon: "👤", color: "#6366f1" },
//     { key: "DIRECTOR_PRJ", label: "Director", icon: "👤", color: "#10b981" },
//   ],
//   MAINTENANCE: [
//     { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
//     { key: "PRJ_INCHARGE", label: "Prj. Incharge", icon: "👤", color: "#ef4444" },
//     { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#ec4899" },
//     { key: "PRESIDENT", label: "President", icon: "👤", color: "#6366f1" },
//     { key: "DIRECTOR_PRJ", label: "Director", icon: "👤", color: "#10b981" },
//   ],
//   PM: [
//     { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
//     { key: "PM", label: "PM", icon: "👤", color: "#8b5cf6" },
//     { key: "PLANNING_QS", label: "Planning & QS", icon: "👤", color: "#f59e0b" },
//     { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#ec4899" },
//     { key: "PRESIDENT_PRJ", label: "President (Prj)", icon: "👤", color: "#6366f1" },
//     { key: "DIRECTOR_PRJ", label: "Director", icon: "👤", color: "#10b981" },
//   ],
//   SAFETY: [
//     { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
//     { key: "SAFETY_OFFICER", label: "Safety Officer", icon: "👤", color: "#f97316" },
//     { key: "PLANNING_QS", label: "Planning & QS", icon: "👤", color: "#f59e0b" },
//     { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#ec4899" },
//     { key: "PRESIDENT_PRJ", label: "President (Prj)", icon: "👤", color: "#6366f1" },
//     { key: "DIRECTOR_PRJ", label: "Director", icon: "👤", color: "#10b981" },
//   ],
// };

// const INFO_FIELDS = [
//   { key: "PR_USR", label: "PR User", icon: "👤", color: "#0891b2" },
// ];

// const TYPE_PALETTE = [
//   "#6366f1", "#ef4444", "#10b981", "#f59e0b",
//   "#3b82f6", "#ec4899", "#0891b2", "#84cc16",
// ];

// const EMAIL_SLOT_COLORS = ["#0891b2", "#7c3aed", "#059669", "#d97706", "#dc2626", "#db2777"];

// const CC_KEY_MAP = {
//   RAISER: "RAISER_CC",
//   PLANNING_QS: "PLANNING_QS_CC",
//   PRJ_INCHARGE: "PRJ_INCHARGE_CC",
//   PRJ_HEAD: "PRJ_HEAD_CC",
//   PRESIDENT_PRJ: "PRESIDENT_PRJ_CC",
//   PRESIDENT: "PRESIDENT_CC",
//   DIRECTOR_PRJ: "DIRECTOR_PRJ_CC",
//   PM: "PM_CC",
//   SAFETY_OFFICER: "SAFETY_OFFICER_CC",
//   PR_USR: "PR_USR_CC",
// };

// // ─── HELPERS ──────────────────────────────────────────────────────────────────
// function getFlowType(plantType, selectedDropdown) {
//   if (selectedDropdown === "SAFETY") return "SAFETY";
//   if (selectedDropdown === "PM") return "PM";
//   if (!plantType) return "PROJECTS";
//   const t = plantType.toUpperCase();
//   if (t.includes("MAINTENANCE") || t.includes("MAINT")) return "MAINTENANCE";
//   if (t.includes("RMC")) return "RMC";
//   return "PROJECTS";
// }

// function chunkArray(arr, size) {
//   const rows = [];
//   for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
//   return rows;
// }

// function parseEmails(raw) {
//   if (!raw || raw === "NULL") return [];
//   return raw.split(",").map(e => e.trim()).filter(Boolean);
// }

// function parseRaisers(rawValue) {
//   if (!rawValue || rawValue === "NULL") return [];
//   return String(rawValue).split(",").map(s => s.trim()).filter(Boolean);
// }

// function buildRaiserSlots(rawValue) {
//   const names = parseRaisers(rawValue);
//   if (names.length === 0) return [null];
//   return names.map(n => ({ name: n }));
// }

// // ─── FLOW DIAGRAM ─────────────────────────────────────────────────────────────
// function FlowDiagram({ steps, flowType }) {
//   const arrowColors = {
//     PROJECTS: "#3b82f6", RMC: "#10b981", MAINTENANCE: "#f59e0b", PM: "#8b5cf6",
//   };
//   const arrowColor = arrowColors[flowType] ?? "#64748b";
//   return (
//     <div className="flex flex-wrap items-center gap-1">
//       {steps.map((step, i) => (
//         <div key={step.key} className="flex items-center gap-1">
//           <div className="px-2 py-1 text-xs font-bold text-white rounded-lg" style={{ background: step.color }}>
//             {step.label}
//           </div>
//           {i < steps.length - 1 && (
//             <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
//               <path d="M0 6h12M8 1l7 5-7 5" stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//           )}
//         </div>
//       ))}
//       <div className="flex items-center gap-1 pl-2 ml-2 border-l-2 border-dashed border-slate-200">
//         {INFO_FIELDS.map((f, i) => (
//           <div key={f.key} className="flex items-center gap-1">
//             <div className="px-2 py-1 text-xs font-semibold border rounded-lg"
//               style={{ color: f.color, borderColor: `${f.color}40`, background: `${f.color}10` }}>
//               {f.label}
//             </div>
//             {i < INFO_FIELDS.length - 1 && <span className="text-xs text-slate-300">·</span>}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── PREVIOUS USER BADGE ──────────────────────────────────────────────────────
// function PreviousUserBadge({ prevLog, color }) {
//   const formattedDate = prevLog?.APPLICABLE_DATE
//     ? new Date(prevLog.APPLICABLE_DATE).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
//     : prevLog?.created_at
//       ? new Date(prevLog.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
//       : null;

//   if (!prevLog) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
//         className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl"
//         style={{ background: "#f8fafc", border: "1px dashed #e2e8f0" }}>
//         <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-lg" style={{ background: "#f1f5f9" }}>
//           <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
//             <path d="M12 8v4l3 3" stroke="#494b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//             <path d="M3.05 11a9 9 0 1 0 .5-4.5" stroke="#494b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//             <path d="M3 3v5h5" stroke="#494b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </div>
//         <div>
//           <p className="font-bold tracking-wide uppercase" style={{ fontSize: "9px", color: "#404244" }}>Previous Holder</p>
//           <p className="text-xs italic text-slate-400">No previous holder on record</p>
//         </div>
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
//       className="mb-3 overflow-hidden rounded-xl" style={{ border: `1px solid ${color}25` }}>
//       <div className="flex items-center gap-1.5 px-3 py-1.5"
//         style={{ background: `${color}12`, borderBottom: `1px solid ${color}20` }}>
//         <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
//           <path d="M12 8v4l3 3" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
//           <path d="M3.05 11a9 9 0 1 0 .5-4.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
//           <path d="M3 3v5h5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//         <span className="font-black tracking-widest uppercase" style={{ fontSize: "9px", color }}>Previous Holder</span>
//       </div>
//       <div className="flex items-center gap-3 px-3 py-2" style={{ background: `${color}06` }}>
//         <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-xs font-black text-white rounded-lg"
//           style={{ background: `linear-gradient(135deg,${color}80,${color}40)` }}>
//           {(prevLog.PREVIOUS_USER || "?").charAt(0).toUpperCase()}
//         </div>
//         <div className="flex-1 min-w-0">
//           <div className="flex flex-wrap items-center gap-2">
//             <span className="text-sm font-bold truncate text-slate-800">{prevLog.PREVIOUS_USER || "—"}</span>
//             {prevLog.EMP_ID && (
//               <span className="font-mono px-1.5 py-0.5 rounded-md text-white flex-shrink-0"
//                 style={{ fontSize: "9px", background: `${color}70` }}>{prevLog.EMP_ID}</span>
//             )}
//           </div>
//           {prevLog.EMP_NAME && (
//             <p className="flex items-center gap-1 mt-0.5" style={{ fontSize: "9px", color: `${color}70` }}>
//               Changed by {prevLog.EMP_NAME}
//             </p>
//           )}
//           {formattedDate && (
//             <p className="flex items-center gap-1 mt-0.5" style={{ fontSize: "9px", color: `${color}90` }}>
//               Replaced on {formattedDate}
//             </p>
//           )}
//         </div>
//         <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
//           <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//             <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//           <span style={{ fontSize: "8px", color: `${color}70`, fontWeight: 700 }}>current</span>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // ─── PREVIOUS EMAIL BADGE ─────────────────────────────────────────────────────
// function PreviousEmailBadge({ prevLog, color }) {
//   const formattedDate = prevLog?.APPLICABLE_DATE
//     ? new Date(prevLog.APPLICABLE_DATE).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
//     : prevLog?.created_at
//       ? new Date(prevLog.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
//       : null;

//   if (!prevLog) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
//         className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl"
//         style={{ background: "#f8fafc", border: "1px dashed #e2e8f0" }}>
//         <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-lg"
//           style={{ background: "#f1f5f9" }}>
//           <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
//             <path d="M12 8v4l3 3" stroke="#494b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//             <path d="M3.05 11a9 9 0 1 0 .5-4.5" stroke="#494b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//             <path d="M3 3v5h5" stroke="#494b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </div>
//         <div>
//           <p className="font-bold tracking-wide uppercase" style={{ fontSize: "9px", color: "#404244" }}>Previous CC Email</p>
//           <p className="text-xs italic text-slate-400">No previous CC email on record</p>
//         </div>
//       </motion.div>
//     );
//   }

//   const prevEmails = prevLog.PREVIOUS_EMAIL
//     ? prevLog.PREVIOUS_EMAIL.split(",").map(e => e.trim()).filter(Boolean)
//     : [];
//   const currEmails = prevLog.CURRENT_EMAIL
//     ? prevLog.CURRENT_EMAIL.split(",").map(e => e.trim()).filter(Boolean)
//     : [];

//   return (
//     <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
//       className="mb-2 overflow-hidden rounded-xl" style={{ border: `1px solid ${color}25` }}>
//       <div className="flex items-center gap-1.5 px-3 py-1.5"
//         style={{ background: `${color}12`, borderBottom: `1px solid ${color}20` }}>
//         <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
//           <path d="M12 8v4l3 3" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
//           <path d="M3.05 11a9 9 0 1 0 .5-4.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
//           <path d="M3 3v5h5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//         <span className="font-black tracking-widest uppercase" style={{ fontSize: "9px", color }}>
//           Previous CC Email History
//         </span>
//       </div>
//       <div className="px-3 py-2" style={{ background: `${color}06` }}>
//         <div className="flex items-start gap-3">
//           {/* Previous emails */}
//           <div className="flex-1 min-w-0">
//             <p className="mb-1 font-black uppercase" style={{ fontSize: "8px", color: `${color}80` }}>Before</p>
//             {prevEmails.length === 0 ? (
//               <p className="text-xs italic text-slate-400">None</p>
//             ) : prevEmails.map((em, i) => (
//               <div key={i} className="flex items-center gap-1 mb-0.5">
//                 <span className="flex items-center justify-center flex-shrink-0 w-4 h-4 text-white rounded-full"
//                   style={{ fontSize: "8px", background: `${color}60` }}>{i + 1}</span>
//                 <p className="text-xs font-semibold truncate text-slate-600">{em}</p>
//               </div>
//             ))}
//           </div>
//           {/* Arrow */}
//           <div className="flex flex-col items-center justify-center flex-shrink-0 pt-4">
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//               <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//           </div>
//           {/* Current emails */}
//           <div className="flex-1 min-w-0">
//             <p className="mb-1 font-black uppercase" style={{ fontSize: "8px", color }}>After</p>
//             {currEmails.length === 0 ? (
//               <p className="text-xs italic text-slate-400">None</p>
//             ) : currEmails.map((em, i) => (
//               <div key={i} className="flex items-center gap-1 mb-0.5">
//                 <span className="flex items-center justify-center flex-shrink-0 w-4 h-4 text-white rounded-full"
//                   style={{ fontSize: "8px", background: color }}>{i + 1}</span>
//                 <p className="text-xs font-bold truncate text-slate-800">{em}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//         {formattedDate && (
//           <p className="flex items-center gap-1 mt-1.5" style={{ fontSize: "9px", color: `${color}90` }}>
//             <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
//               <path d="M6 4v2l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//               <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
//             </svg>
//             Changed on {formattedDate}
//           </p>
//         )}
//       </div>
//     </motion.div>
//   );
// }

// // ─── SHARED REPLACE FORM ──────────────────────────────────────────────────────
// function ReplaceForm({ step, onReplace, isEmail = false, currentValue = "" }) {
//   const [newEmpId, setNewEmpId] = useState("");
//   const [newName, setNewName] = useState("");
//   const [newUsername, setNewUsername] = useState("");
//   const [applicableDate, setDate] = useState("");
//   const [fetching, setFetching] = useState(false);
//   const [fetchError, setFetchError] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [saveState, setSaveState] = useState(null);
//   const [saveMsg, setSaveMsg] = useState("");
//   const debounceRef = useRef(null);

//   const getToken = () => {
//     try { return JSON.parse(localStorage.getItem("userInfo"))?.token ?? null; }
//     catch { return null; }
//   };

//   const handleEmpIdChange = (e) => {
//     const val = e.target.value;
//     setNewEmpId(val); setFetchError(null); setSaveState(null);
//     setNewName(""); setNewUsername("");
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     if (val.trim().length < 3) return;
//     debounceRef.current = setTimeout(async () => {
//       setFetching(true);
//       try {
//         const token = getToken();
//         const res = await fetch(
//           `${API_BASE_URL}get-emp-by-id?EMP_ID=${encodeURIComponent(val.trim())}`,
//           { headers: { "Content-Type": "application/json", Accept: "application/json", ...(token && { Authorization: `Bearer ${token}` }) } }
//         );
//         const json = await res.json();
//         if (!res.ok && res.status === 404) throw new Error("Not found");
//         const emp = json.data ?? json;
//         const name = (emp.EMP_NAME ?? "").trim();
//         let username = (emp.user_name ?? "").trim();
//         const emailSources = [emp.OFC_MAIL, emp.EMP_MAIL].filter(Boolean);
//         if (!username) {
//           for (const mail of emailSources) {
//             const at = mail.indexOf("@");
//             if (at !== -1) { username = mail.substring(0, at); break; }
//             username = mail; break;
//           }
//         }
//         if (!name && !username) throw new Error("Empty record");
//         if (isEmail && emailSources.length > 0) setNewUsername(emailSources[0]);
//         else setNewUsername(username);
//         setNewName(name); setFetchError(null);
//       } catch {
//         setFetchError("No employee found.");
//         setNewName(""); setNewUsername("");
//       } finally { setFetching(false); }
//     }, 600);
//   };

//   const handleSave = async () => {
//     if (!newEmpId.trim() || !newName.trim() || !newUsername.trim() || !applicableDate) return;
//     let normalizedDate = applicableDate;
//     const parts = applicableDate.split("-");
//     if (parts.length === 3 && parts[0].length !== 4) normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
//     setSaving(true); setSaveState(null); setSaveMsg("");
//     try {
//       await onReplace({ name: newName, emp_id: newEmpId, username: newUsername, date: normalizedDate });
//       setSaveState("success"); setSaveMsg("Saved!");
//     } catch (err) {
//       setSaveState("error"); setSaveMsg(err.message ?? "Failed.");
//     } finally { setSaving(false); }
//   };

//   const today = new Date().toLocaleDateString("en-CA");
//   let comparableDate = applicableDate;
//   const _parts = applicableDate ? applicableDate.split("-") : [];
//   if (_parts.length === 3 && _parts[0].length !== 4) comparableDate = `${_parts[2]}-${_parts[1]}-${_parts[0]}`;
//   const isFuture = comparableDate > today;
//   const canSave = newEmpId.trim() && newName.trim() && newUsername.trim() && applicableDate && !fetching && !saving;

//   const inp = "w-full px-1.5 py-1 text-xs font-bold rounded-md border-2 focus:outline-none transition-colors placeholder:text-slate-400 placeholder:font-normal bg-white border-slate-400 focus:border-blue-500 text-slate-800";
//   const inpOk = "w-full px-1.5 py-1 text-xs font-bold rounded-md border-2 focus:outline-none transition-colors bg-emerald-50 border-emerald-400 text-slate-800";
//   const lbl = "block font-black text-slate-700 mb-0.5";

//   return (
//     <div className="space-y-0.5">
//       <div className="flex items-end gap-1">
//         <div style={{ width: "70px", flexShrink: 0 }}>
//           <label style={{ fontSize: "9px" }} className={lbl}>
//             EMP ID
//             {fetching && <svg className="inline ml-1 animate-spin" width="8" height="8" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" /><path d="M12 2a10 10 0 0 1 10 10" stroke={step.color} strokeWidth="4" strokeLinecap="round" /></svg>}
//             {!fetching && newName && <span className="ml-1 text-emerald-500">✓</span>}
//             {fetchError && <span className="ml-1 text-red-400">✗</span>}
//           </label>
//           <input type="text" value={newEmpId} onChange={handleEmpIdChange}
//             placeholder="EMP___" className={inp}
//             style={{ borderColor: fetchError ? "#ef4444" : undefined }} />
//         </div>
//         <div style={{ flex: "1.1" }}>
//           <label style={{ fontSize: "9px" }} className={lbl}>
//             {isEmail ? "Email" : "Username"}{newUsername && <span className="ml-1 text-emerald-400">✦</span>}
//           </label>
//           <div className="relative group">
//             <input type={isEmail ? "email" : "text"} value={newUsername}
//               onChange={(e) => setNewUsername(e.target.value)}
//               placeholder={isEmail ? "email@domain.com" : "Auto-filled"}
//               className={newUsername ? inpOk : inp} />
//             {isEmail && newUsername && (
//               <div className="absolute z-50 left-0 bottom-full mb-1.5 hidden group-hover:block pointer-events-none px-2.5 py-1.5 rounded-lg shadow-lg"
//                 style={{
//                   background: "#1e293b",
//                   color: "#93c5fd",
//                   fontSize: "11px",
//                   fontWeight: 600,
//                   whiteSpace: "nowrap",
//                 }}>
//                 {newUsername}
//               </div>
//             )}
//           </div>
//         </div>
//         <div style={{ flex: "1.3" }}>
//           <label style={{ fontSize: "9px" }} className={lbl}>
//             Full Name{newName && <span className="ml-1 text-emerald-400">✦</span>}
//           </label>
//           <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
//             placeholder="Auto-filled from EMP ID"
//             className={newName ? inpOk : inp} />
//         </div>
//         <div style={{ width: "105px", flexShrink: 0 }}>
//           <label style={{ fontSize: "9px" }} className={lbl}>From Date</label>
//           <input type="date" value={applicableDate}
//             onChange={(e) => { setDate(e.target.value); setSaveState(null); }}
//             className={inp} />
//         </div>
//         <div style={{ flexShrink: 0 }}>
//           <div style={{ height: "15px" }} />
//           <motion.button
//             whileHover={{ scale: canSave ? 1.02 : 1 }} whileTap={{ scale: canSave ? 0.97 : 1 }}
//             onClick={handleSave} disabled={!canSave}
//             className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white transition-all rounded-md disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
//             style={{
//               background: saveState === "success"
//                 ? "linear-gradient(135deg,#10b981,#059669)"
//                 : saving ? `${step.color}99`
//                   : `linear-gradient(135deg,${step.color},${step.color}cc)`
//             }}>
//             {saving && <svg className="animate-spin" width="9" height="9" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" /><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="4" strokeLinecap="round" /></svg>}
//             {saveState === "success" ? "✓ Saved" : saving ? "…" : "Update"}
//           </motion.button>
//         </div>
//       </div>
//       {(applicableDate || fetchError || saveState === "error") && (
//         <div className="flex items-center gap-3 pt-0.5">
//           {applicableDate && (
//             <p style={{ fontSize: "9px", color: isFuture ? "#f59e0b" : "#10b981" }} className="font-semibold">
//               {isFuture ? `⏰ Scheduled ${applicableDate}` : "⚡ Applies immediately"}
//             </p>
//           )}
//           {fetchError && <p style={{ fontSize: "9px" }} className="text-red-400">{fetchError}</p>}
//           {saveState === "error" && <p style={{ fontSize: "9px" }} className="font-semibold text-red-500">✗ {saveMsg}</p>}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── DELETE CONFIRM ────────────────────────────────────────────────────────────
// function DeleteConfirm({ step, currentUser, onDelete, onCancel }) {
//   const [deleting, setDeleting] = useState(false);
//   const [done, setDone] = useState(false);
//   const [error, setError] = useState(null);

//   const handleDelete = async () => {
//     setDeleting(true); setError(null);
//     try { await onDelete(); setDone(true); }
//     catch (err) { setError(err.message ?? "Delete failed."); }
//     finally { setDeleting(false); }
//   };

//   if (done) {
//     return (
//       <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl"
//         style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#15803d" }}>
//         ✓ Removed successfully
//       </div>
//     );
//   }

//   return (
//     <div className="p-3 border rounded-xl" style={{ borderColor: "#ef444440", background: "#fef2f2" }}>
//       <p className="mb-1 text-xs font-bold text-red-700">Remove this position?</p>
//       {currentUser && (
//         <p className="mb-3 text-xs text-slate-600">
//           <span className="font-semibold" style={{ color: step.color }}>{currentUser}</span> will be removed from <strong>{step.label}</strong>.
//         </p>
//       )}
//       {error && <p className="mb-2 text-xs text-red-600">✗ {error}</p>}
//       <div className="flex gap-2">
//         <button onClick={onCancel}
//           className="flex-1 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
//           Cancel
//         </button>
//         <button onClick={handleDelete} disabled={deleting}
//           className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-1"
//           style={{ background: deleting ? "#ef444499" : "linear-gradient(135deg,#ef4444,#dc2626)" }}>
//           {deleting ? (
//             <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none">
//               <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
//               <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="4" strokeLinecap="round" />
//             </svg>
//           ) : "✗ Confirm Remove"}
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── EMAIL EDIT PANEL ─────────────────────────────────────────────────────────
// function EmailEditPanel({ step, emailSlots, onReplace, onDelete, onAddNew, onClose }) {
//   const [activeSlot, setActiveSlot] = useState(null);
//   const [addForms, setAddForms] = useState([]);

//   const addNewForm = () => setAddForms(prev => [...prev, { id: Date.now() }]);
//   const removeForm = (id) => setAddForms(prev => prev.filter(f => f.id !== id));

//   return (
//     <div className="p-3 mt-1 border rounded-2xl" style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>
//       <div className="flex items-center justify-between mb-2">
//         <span className="text-xs font-black tracking-widest uppercase" style={{ color: step.color }}>
//           Manage CC Emails
//         </span>
//         <button onClick={onClose}
//           className="px-2 py-1 text-xs transition-colors border rounded-lg text-slate-600 border-slate-200 hover:bg-slate-50">
//           ✕ Close
//         </button>
//       </div>

//       <div className="space-y-2">
//         {emailSlots.length === 0 && (
//           <div className="p-3 text-xs text-center border rounded-xl bg-slate-50 border-slate-200 text-slate-400">
//             No CC emails configured. Add one below.
//           </div>
//         )}
//         {emailSlots.map((email, idx) => {
//           const isActive = activeSlot?.idx === idx;
//           const slotColor = EMAIL_SLOT_COLORS[idx % EMAIL_SLOT_COLORS.length];
//           return (
//             <div key={`email-slot-${idx}`} className="overflow-hidden border rounded-xl"
//               style={{ borderColor: `${slotColor}25`, background: "white" }}>
//               <div className="flex items-center gap-2 px-3 py-2">
//                 <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 font-black text-white rounded-full"
//                   style={{ background: slotColor, fontSize: "9px" }}>{idx + 1}</div>
//                 <div className="flex items-center justify-center flex-shrink-0 text-sm rounded-lg w-7 h-7"
//                   style={{ background: `${slotColor}18` }}>📧</div>
//                 <div className="flex-1 min-w-0">
//   <p className="text-xs font-bold truncate" style={{ color: slotColor }}>{email}</p>
//   <p style={{ fontSize: "9px", color: "#94a3b8" }}>Email slot {idx + 1} of {emailSlots.length}</p>
// </div>
//                 <div className="flex gap-1.5 flex-shrink-0">
//                   <button
//                     onClick={() => setActiveSlot(isActive && activeSlot?.mode === "change" ? null : { idx, mode: "change" })}
//                     className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white transition-all rounded-lg"
//                     style={{ background: isActive && activeSlot?.mode === "change" ? "#d97706" : "#f59e0b" }}>
//                     <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
//                       <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15H2v-3L11.5 2.5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                     Change
//                   </button>
//                   <button
//                     onClick={() => setActiveSlot(isActive && activeSlot?.mode === "delete" ? null : { idx, mode: "delete" })}
//                     className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white transition-all rounded-lg"
//                     style={{ background: isActive && activeSlot?.mode === "delete" ? "#dc2626" : "#ef444499" }}>
//                     <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
//                       <path d="M2 3h8M5 1h2M4 3v7M8 3v7M2 3l1 8h6l1-8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                     Del
//                   </button>
//                 </div>
//               </div>
//               <AnimatePresence>
//                 {isActive && activeSlot?.mode === "change" && (
//                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
//                     <div className="px-3 pt-1 pb-3 border-t" style={{ borderColor: "#f59e0b30" }}>
//                       <p className="mb-2 text-xs font-bold" style={{ color: "#f59e0b" }}>Change Email</p>
//                       <ReplaceForm step={{ ...step, color: "#f59e0b" }} currentValue={email} isEmail={true}
//                         onReplace={(data) => { onReplace(idx, data); setActiveSlot(null); }} />
//                     </div>
//                   </motion.div>
//                 )}
//                 {isActive && activeSlot?.mode === "delete" && (
//                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
//                     <div className="px-3 pt-1 pb-3 border-t" style={{ borderColor: "#ef444430" }}>
//                       <DeleteConfirm step={{ ...step, color: slotColor, label: `Email ${idx + 1}` }} currentUser={email}
//                         onDelete={() => { onDelete(idx); setActiveSlot(null); }}
//                         onCancel={() => setActiveSlot(null)} />
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           );
//         })}
//       </div>

//       <AnimatePresence>
//         {addForms.map((form, formIdx) => (
//           <motion.div key={form.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
//             <div className="p-3 mt-2 border rounded-xl" style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-xs font-bold" style={{ color: step.color }}>
//                   New Email #{emailSlots.length + formIdx + 1}
//                 </span>
//                 <button onClick={() => removeForm(form.id)} className="text-xs transition-colors text-slate-600 hover:text-red-500">
//                   ✕ Remove
//                 </button>
//               </div>
//               <ReplaceForm key={form.id} step={step} currentValue="" isEmail={true}
//                 onReplace={async (data) => { await onAddNew(data); removeForm(form.id); }} />
//             </div>
//           </motion.div>
//         ))}
//       </AnimatePresence>

//       <button onClick={addNewForm}
//         className="flex items-center justify-center w-full gap-2 py-2 mt-3 text-xs font-bold transition-all border-2 border-dashed rounded-xl hover:shadow-sm"
//         style={{ borderColor: `${step.color}50`, color: step.color, background: `${step.color}05` }}>
//         <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//           <path d="M6 1v10M1 6h10" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
//         </svg>
//         Add New Email
//       </button>
//     </div>
//   );
// }

// // ─── POSITION CC EMAILS WIDGET ────────────────────────────────────────────────
// function PositionCCEmails({ positionKey, ccValue, step, onAddEmail, onReplaceEmail, onDeleteEmail, emailLog }) {
//   const [open, setOpen] = useState(false);
//   const resolvedValue = (ccValue && ccValue !== "NULL" && ccValue.trim())
//     ? ccValue
//     : (emailLog?.CURRENT_EMAIL ?? "");
//   const emails = parseEmails(resolvedValue);
//   const ccKey = CC_KEY_MAP[positionKey] ?? `${positionKey}_CC`;

//   return (
//     <div className="pt-2 mt-2 border-t" style={{ borderColor: `${step.color}20` }}>
//       <button onClick={() => setOpen(!open)} className="w-full group">
//         <div className="flex items-center gap-2 px-3 py-2 transition-all duration-300 border-2 cursor-pointer rounded-xl hover:shadow-md"
//           style={{
//             borderColor: open ? step.color : `${step.color}30`,
//             background: open ? `linear-gradient(135deg,${step.color}15,${step.color}08)` : `${step.color}05`,
//             boxShadow: open ? `0 2px 12px ${step.color}20` : "none",
//             borderStyle: "dashed",
//           }}>
//           <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm transition-transform rounded-lg group-hover:scale-110"
//             style={{ background: `${step.color}20` }}>📧</div>
//           <div className="flex-1 min-w-0 text-left">
//             <div className="flex items-center gap-1.5">
//               <p className="font-bold uppercase" style={{ color: step.color, fontSize: "10px", letterSpacing: "0.08em" }}>
//                 CC Emails
//               </p>
//               <span className="px-1.5 py-0.5 rounded-md font-bold flex-shrink-0"
//                 style={{ fontSize: "9px", background: `${step.color}15`, color: step.color }}>INFO</span>
//               {emailLog && (
//                 <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
//                   style={{ background: step.color, opacity: 0.5 }} title="Has CC email history" />
//               )}
//             </div>
//             <p className="text-xs font-semibold leading-tight truncate text-slate-800">
//               {emails.length === 0
//                 ? <span className="italic text-slate-400">No emails assigned</span>
//                 : emails.length === 1 ? emails[0] : `${emails.length} emails configured`}
//             </p>
//           </div>
//           <div className="flex items-center gap-1.5 flex-shrink-0">
//             {emails.length > 0 && (
//               <span className="px-1.5 py-0.5 rounded-full text-white font-black"
//                 style={{ fontSize: "8px", background: step.color }}>{emails.length}</span>
//             )}
//             <div className="flex items-center justify-center w-6 h-6 transition-transform duration-300 rounded-full"
//               style={{ background: `${step.color}15`, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
//               <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//                 <path d="M2 4l4 4 4-4" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
//               </svg>
//             </div>
//           </div>
//         </div>
//       </button>

//       <AnimatePresence>
//         {open && (
//           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
//             <div className="mt-2">
//               <PreviousEmailBadge prevLog={emailLog ?? null} color={step.color} />
//             </div>
//             <EmailEditPanel
//               step={{ ...step, label: `${step.label} CC` }}
//               emailSlots={emails}
//               onReplace={(idx, data) => onReplaceEmail(ccKey, idx, data)}
//               onDelete={(idx) => onDeleteEmail(ccKey, idx)}
//               onAddNew={(data) => onAddEmail(ccKey, data)}
//               onClose={() => setOpen(false)}
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ─── APPROVAL USER CARD ───────────────────────────────────────────────────────
// function UserCard({ step, stepNumber, user, onReplace, onDelete, isInfoOnly, prevLog, slotLabel,
//   indentUsers, onAddCCEmail, onReplaceCCEmail, onDeleteCCEmail, emailLogs }) {
//   const [expanded, setExpanded] = useState(false);
//   const [actionMode, setActionMode] = useState(null);
//   const displayLabel = slotLabel || step.label;

//   const handleToggle = () => { setExpanded(prev => !prev); setActionMode(null); };

//   return (
//     <div className="relative flex-1 min-w-0">
//       {!isInfoOnly && (
//         <div className="absolute z-10 flex items-center justify-center w-5 h-5 text-xs font-black text-white rounded-full -top-2 -left-1"
//           style={{ background: step.color }}>{stepNumber}</div>
//       )}
//       <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={isInfoOnly ? "" : "ml-2"}>
//         <button onClick={handleToggle} className="w-full group">
//           <div className="flex items-center gap-2 px-3 py-2 transition-all duration-300 border-2 cursor-pointer rounded-xl hover:shadow-md"
//             style={{
//               borderColor: expanded ? step.color : (isInfoOnly ? `${step.color}30` : "#e2e8f0"),
//               background: expanded ? `linear-gradient(135deg,${step.color}15,${step.color}08)` : isInfoOnly ? `${step.color}05` : "white",
//               boxShadow: expanded ? `0 2px 12px ${step.color}20` : "none",
//               borderStyle: isInfoOnly ? "dashed" : "solid",
//             }}>
//             <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm transition-transform rounded-lg group-hover:scale-110"
//               style={{ background: `${step.color}20` }}>{step.icon}</div>
//             <div className="flex-1 min-w-0 text-left">
//               <div className="flex items-center gap-1.5">
//                 <p className="font-bold uppercase truncate" style={{ color: step.color, fontSize: "10px", letterSpacing: "0.08em" }}>
//                   {displayLabel}
//                 </p>
//                 {isInfoOnly && (
//                   <span className="px-1.5 py-0.5 rounded-md font-bold flex-shrink-0"
//                     style={{ fontSize: "9px", background: `${step.color}15`, color: step.color }}>INFO</span>
//                 )}
//                 {prevLog && (
//                   <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
//                     style={{ background: step.color, opacity: 0.5 }} title="Has position history" />
//                 )}
//               </div>
//               <p className="text-xs font-semibold leading-tight truncate text-slate-800">
//                 {user ? user : <span className="italic text-slate-400">Not assigned</span>}
//               </p>
//               {!expanded && prevLog?.PREVIOUS_USER && (
//                 <p className="truncate leading-tight flex items-center gap-1 mt-0.5" style={{ fontSize: "9px", color: "#4a4e53" }}>
//                   <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
//                     <path d="M6 4v2l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                     <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
//                   </svg>
//                   prev: {prevLog.PREVIOUS_USER}
//                 </p>
//               )}
//             </div>
//             <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 transition-transform duration-300 rounded-full"
//               style={{ background: `${step.color}15`, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
//               <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//                 <path d="M2 4l4 4 4-4" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
//               </svg>
//             </div>
//           </div>
//         </button>

//         <AnimatePresence>
//           {expanded && (
//             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
//               <div className="p-3 mx-1 mt-1 border rounded-xl" style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>
//                 {user ? (
//                   <div className="flex items-center gap-2 mb-3">
//                     <div className="flex items-center justify-center flex-shrink-0 text-sm font-bold text-white w-9 h-9 rounded-xl"
//                       style={{ background: `linear-gradient(135deg,${step.color},${step.color}99)` }}>
//                       {user.charAt(0).toUpperCase()}
//                     </div>
//                     <div>
//                       <div className="flex items-center gap-1.5 mb-0.5">
//                         <span className="font-black tracking-wide uppercase text-emerald-600" style={{ fontSize: "9px" }}>● Current</span>
//                       </div>
//                       <p className="text-sm font-bold leading-tight text-slate-800">{user}</p>
//                       <p className="text-xs text-slate-400 mt-0.5">{step.label}</p>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="p-2 mb-3 text-xs text-center border rounded-lg bg-slate-50 border-slate-200 text-slate-400">
//                     No user assigned to this role for the selected plant.
//                   </div>
//                 )}

//                 <PreviousUserBadge prevLog={prevLog ?? null} color={step.color} />

//                 {!isInfoOnly && (
//                   <>
//                     {!actionMode && (
//                       <div className="flex gap-2 mb-2">
//                         <button onClick={() => setActionMode("add")}
//                           className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
//                           style={{ background: `linear-gradient(135deg,${step.color},${step.color}cc)` }}>
//                           <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//                             <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
//                           </svg>
//                           Newly Add
//                         </button>
//                         {user && (
//                           <button onClick={() => setActionMode("change")}
//                             className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
//                             style={{ background: `linear-gradient(135deg,#f59e0b,#d97706)` }}>
//                             <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
//                               <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15H2v-3L11.5 2.5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                             </svg>
//                             Change
//                           </button>
//                         )}
//                         {user && (
//                           <button onClick={() => setActionMode("delete")}
//                             className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
//                             style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
//                             <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//                               <path d="M2 3h8M5 1h2M4 3v7M8 3v7M2 3l1 8h6l1-8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                             </svg>
//                           </button>
//                         )}
//                       </div>
//                     )}
//                     {actionMode === "add" && (
//                       <div>
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="text-xs font-bold" style={{ color: step.color }}>Newly Add</span>
//                           <button onClick={() => setActionMode(null)} className="text-xs text-slate-400 hover:text-slate-600">← back</button>
//                         </div>
//                         <ReplaceForm step={step} currentValue=""
//                           onReplace={(data) => { onReplace(step.key, data); setActionMode(null); }} />
//                       </div>
//                     )}
//                     {actionMode === "change" && (
//                       <div>
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="text-xs font-bold" style={{ color: "#f59e0b" }}>Change Position</span>
//                           <button onClick={() => setActionMode(null)} className="text-xs text-slate-400 hover:text-slate-600">← back</button>
//                         </div>
//                         <ReplaceForm step={{ ...step, color: "#f59e0b" }} currentValue={user}
//                           onReplace={(data) => { onReplace(step.key, data); setActionMode(null); }} />
//                       </div>
//                     )}
//                     {actionMode === "delete" && (
//                       <div>
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="text-xs font-bold text-red-600">Delete Position</span>
//                           <button onClick={() => setActionMode(null)} className="text-xs text-slate-400 hover:text-slate-600">← back</button>
//                         </div>
//                         <DeleteConfirm step={step} currentUser={user}
//                           onDelete={() => onDelete(step.key)} onCancel={() => setActionMode(null)} />
//                       </div>
//                     )}
//                   </>
//                 )}

//                 {isInfoOnly && onReplace && (
//                   <>
//                     <div className="flex items-center gap-2 mb-2">
//                       <div className="flex-1 h-px bg-slate-200" />
//                       <span className="text-xs font-medium text-slate-400">Update</span>
//                       <div className="flex-1 h-px bg-slate-200" />
//                     </div>
//                     <ReplaceForm step={step} currentValue={user} onReplace={(data) => onReplace(step.key, data)} />
//                   </>
//                 )}

//                 {/* ── CC Emails for this position ── */}
//                 <PositionCCEmails
//                   positionKey={step.key}
//                   ccValue={indentUsers?.[CC_KEY_MAP[step.key]] ?? ""}
//                   step={step}
//                   onAddEmail={onAddCCEmail}
//                   onReplaceEmail={onReplaceCCEmail}
//                   onDeleteEmail={onDeleteCCEmail}
//                   emailLog={emailLogs?.[CC_KEY_MAP[step.key]] ?? null}
//                 />
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>
//     </div>
//   );
// }

// // ─── RAISER EDIT PANEL ────────────────────────────────────────────────────────
// function RaiserEditPanel({ step, raiserSlots, onReplace, onDelete, onAddNew, positionLogs,
//   onClose, indentUsers, onAddCCEmail, onReplaceCCEmail, onDeleteCCEmail, emailLogs }) {
//   const [activeSlot, setActiveSlot] = useState(null);
//   const [addForms, setAddForms] = useState([{ id: Date.now() }]);

//   const addNewForm = () => setAddForms(prev => [...prev, { id: Date.now() }]);
//   const removeForm = (id) => setAddForms(prev => prev.filter(f => f.id !== id));

//   return (
//     <AnimatePresence>
//       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
//         exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="w-full overflow-hidden">
//         <div className="p-4 mt-2 border rounded-2xl" style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>
//           <div className="flex items-center justify-between mb-3">
//             <span className="text-xs font-black tracking-widest uppercase" style={{ color: step.color }}>Manage Raisers</span>
//             <button onClick={onClose} className="px-2 py-1 text-xs transition-colors border rounded-lg text-slate-600 border-slate-200 hover:bg-slate-50">
//               ✕ Close
//             </button>
//           </div>

//           <div className="space-y-2">
//             {raiserSlots.map((slot, idx) => {
//               const isActive = activeSlot?.idx === idx;
//               const prevLog = positionLogs?.[`RAISER_${idx}`] ?? null;
//               return (
//                 <div key={`raiser-${idx}`} className="overflow-hidden border rounded-xl"
//                   style={{ borderColor: `${step.color}25`, background: "white" }}>
//                   <div className="flex items-center gap-2 px-3 py-2">
//                     <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-black text-white rounded-full"
//                       style={{ background: step.color }}>{idx + 1}</div>
//                     <div className="flex items-center justify-center flex-shrink-0 text-sm rounded-lg w-7 h-7"
//                       style={{ background: `${step.color}18` }}>{step.icon}</div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-xs font-bold truncate text-slate-800">
//                         {slot?.name ?? <span className="italic text-slate-400">Not assigned</span>}
//                       </p>
//                       {prevLog?.PREVIOUS_USER && (
//                         <p style={{ fontSize: "9px" }} className="text-slate-400">prev: {prevLog.PREVIOUS_USER}</p>
//                       )}
//                     </div>
//                     <div className="flex gap-1.5 flex-shrink-0">
//                       {slot?.name && (
//                         <button
//                           onClick={() => setActiveSlot(isActive && activeSlot?.mode === "change" ? null : { idx, mode: "change" })}
//                           className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white transition-all rounded-lg"
//                           style={{ background: isActive && activeSlot?.mode === "change" ? "#d97706" : "#f59e0b" }}>
//                           <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
//                             <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15H2v-3L11.5 2.5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                           </svg>
//                           Change
//                         </button>
//                       )}
//                       <button
//                         onClick={() => setActiveSlot(isActive && activeSlot?.mode === "delete" ? null : { idx, mode: "delete" })}
//                         className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white transition-all rounded-lg"
//                         style={{ background: isActive && activeSlot?.mode === "delete" ? "#dc2626" : "#ef444499" }}>
//                         <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
//                           <path d="M2 3h8M5 1h2M4 3v7M8 3v7M2 3l1 8h6l1-8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
//                         </svg>
//                         Del
//                       </button>
//                     </div>
//                   </div>
//                   <AnimatePresence>
//                     {isActive && activeSlot?.mode === "change" && (
//                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
//                         exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
//                         <div className="px-3 pt-1 pb-3 border-t" style={{ borderColor: "#f59e0b30" }}>
//                           <p className="mb-2 text-xs font-bold" style={{ color: "#f59e0b" }}>Change Position</p>
//                           <ReplaceForm step={{ ...step, color: "#f59e0b" }} currentValue={slot?.name ?? ""}
//                             onReplace={(data) => { onReplace(`RAISER_${idx}`, data); setActiveSlot(null); }} />
//                         </div>
//                       </motion.div>
//                     )}
//                     {isActive && activeSlot?.mode === "delete" && (
//                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
//                         exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
//                         <div className="px-3 pt-1 pb-3 border-t" style={{ borderColor: "#ef444430" }}>
//                           <DeleteConfirm step={step} currentUser={slot?.name}
//                             onDelete={() => { onDelete(`RAISER_${idx}`); setActiveSlot(null); }}
//                             onCancel={() => setActiveSlot(null)} />
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               );
//             })}
//           </div>

//           <AnimatePresence>
//             {addForms.map((form, formIdx) => (
//               <motion.div key={form.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
//                 exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
//                 <div className="p-3 mt-2 border rounded-xl" style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs font-bold" style={{ color: step.color }}>
//                       New Raiser #{raiserSlots.length + formIdx + 1}
//                     </span>
//                     <button onClick={() => removeForm(form.id)} className="text-xs transition-colors text-slate-600 hover:text-red-500">
//                       ✕ Remove
//                     </button>
//                   </div>
//                   <ReplaceForm key={form.id} step={step} currentValue=""
//                     onReplace={async (data) => { await onAddNew(data); removeForm(form.id); }} />
//                 </div>
//               </motion.div>
//             ))}
//           </AnimatePresence>

//           <button onClick={addNewForm}
//             className="flex items-center justify-center w-full gap-2 py-2 mt-3 text-xs font-bold transition-all border-2 border-dashed rounded-xl hover:shadow-sm"
//             style={{ borderColor: `${step.color}50`, color: step.color, background: `${step.color}05` }}>
//             <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//               <path d="M6 1v10M1 6h10" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
//             </svg>
//             Add New Raiser
//           </button>

//           {/* CC Emails for Raiser position */}
//           <PositionCCEmails
//             positionKey="RAISER"
//             ccValue={indentUsers?.[CC_KEY_MAP["RAISER"]] ?? ""}
//             step={step}
//             onAddEmail={onAddCCEmail}
//             onReplaceEmail={onReplaceCCEmail}
//             onDeleteEmail={onDeleteCCEmail}
//             emailLog={emailLogs?.[CC_KEY_MAP["RAISER"]] ?? null}
//           />
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// // ─── MULTI-RAISER CARD GROUP ──────────────────────────────────────────────────
// function MultiRaiserCards({ step, stepNumber, raiserSlots, onReplace, onDelete, onAddNew, positionLogs,
//   indentUsers, onAddCCEmail, onReplaceCCEmail, onDeleteCCEmail, emailLogs }) {
//   const [raiserEditOpen, setRaiserEditOpen] = useState(false);
//   const slots = raiserSlots.length > 0 ? raiserSlots : [null];

//   return (
//     <div className="w-full">
//       <div className="flex items-center gap-2 mb-2 ml-2">
//         {slots.length > 1 && (
//           <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-white flex-shrink-0"
//             style={{ background: step.color, fontSize: "10px", fontWeight: 800 }}>
//             <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
//               <circle cx="5" cy="5" r="2.5" stroke="white" strokeWidth="1.8" />
//               <circle cx="11" cy="5" r="2.5" stroke="white" strokeWidth="1.8" />
//               <path d="M1 14c0-2.2 1.8-3.5 4-3.5M8 14c0-2.2 1.8-3.5 4-3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
//             </svg>
//             {slots.length} Raisers
//           </div>
//         )}
//         <div className="flex-1 h-px" style={{ background: `${step.color}25` }} />
//         <button onClick={() => setRaiserEditOpen(!raiserEditOpen)}
//           className="flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 text-xs font-bold transition-all flex-shrink-0"
//           style={{
//             borderColor: raiserEditOpen ? step.color : `${step.color}40`,
//             background: raiserEditOpen ? `${step.color}15` : `${step.color}08`,
//             color: step.color,
//           }}>
//           <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
//             <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15H2v-3L11.5 2.5z" stroke={step.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//           {raiserEditOpen ? "Close Edit" : "Edit Raisers"}
//         </button>
//       </div>

//       {!raiserEditOpen && (
//         <div className={slots.length === 1 ? "" : "grid gap-3"} style={slots.length > 1 ? { gridTemplateColumns: "1fr 1fr" } : {}}>
//           {slots.map((slot, idx) => (
//             <div key={`raiser-display-${idx}`} className="flex items-center gap-2 px-3 py-2 bg-white border-2 rounded-xl"
//               style={{ borderColor: "#e2e8f0" }}>
//               <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 text-xs font-black text-white rounded-full"
//                 style={{ background: step.color }}>{slots.length === 1 ? "1" : idx + 1}</div>
//               <div className="flex items-center justify-center flex-shrink-0 text-sm rounded-lg w-7 h-7"
//                 style={{ background: `${step.color}20` }}>{step.icon}</div>
//               <div className="flex-1 min-w-0 text-left">
//                 <p className="font-bold uppercase" style={{ color: step.color, fontSize: "10px", letterSpacing: "0.08em" }}>
//                   {slots.length === 1 ? step.label : `Raiser ${idx + 1}`}
//                 </p>
//                 <p className="text-xs font-semibold leading-tight truncate text-slate-800">
//                   {slot?.name ?? <span className="italic text-slate-400">Not assigned</span>}
//                 </p>
//               </div>
//             </div>
//           ))}
//           {slots.length > 1 && slots.length % 2 !== 0 && <div />}
//         </div>
//       )}

//       {raiserEditOpen && (
//         <RaiserEditPanel
//           step={step} raiserSlots={slots} onReplace={onReplace} onDelete={onDelete}
//           onAddNew={onAddNew} positionLogs={positionLogs} onClose={() => setRaiserEditOpen(false)}
//           indentUsers={indentUsers} onAddCCEmail={onAddCCEmail}
//           onReplaceCCEmail={onReplaceCCEmail} onDeleteCCEmail={onDeleteCCEmail}
//           emailLogs={emailLogs}
//         />
//       )}
//     </div>
//   );
// }

// // ─── PR_USR CARD ──────────────────────────────────────────────────────────────
// function PrUserCard({ step, user, onReplace, onDelete, prevLog, indentUsers, onAddCCEmail, onReplaceCCEmail, onDeleteCCEmail, emailLogs }) {
//   const [expanded, setExpanded] = useState(false);
//   const [actionMode, setActionMode] = useState(null);

//   const handleToggle = () => { setExpanded(prev => !prev); setActionMode(null); };

//   return (
//     <div className="relative flex-1 min-w-0">
//       <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
//         <button onClick={handleToggle} className="w-full group">
//           <div className="flex items-center gap-2 px-3 py-2 transition-all duration-300 border-2 cursor-pointer rounded-xl hover:shadow-md"
//             style={{
//               borderColor: expanded ? step.color : `${step.color}30`,
//               background: expanded ? `linear-gradient(135deg,${step.color}15,${step.color}08)` : `${step.color}05`,
//               boxShadow: expanded ? `0 2px 12px ${step.color}20` : "none",
//               borderStyle: "dashed",
//             }}>
//             <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm transition-transform rounded-lg group-hover:scale-110"
//               style={{ background: `${step.color}20` }}>{step.icon}</div>
//             <div className="flex-1 min-w-0 text-left">
//               <div className="flex items-center gap-1.5">
//                 <p className="font-bold uppercase truncate" style={{ color: step.color, fontSize: "10px", letterSpacing: "0.08em" }}>
//                   {step.label}
//                 </p>
//                 <span className="px-1.5 py-0.5 rounded-md font-bold flex-shrink-0"
//                   style={{ fontSize: "9px", background: `${step.color}15`, color: step.color }}>INFO</span>
//                 {prevLog && (
//                   <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
//                     style={{ background: step.color, opacity: 0.5 }} />
//                 )}
//               </div>
//               <p className="text-xs font-semibold leading-tight truncate text-slate-800">
//                 {user ? user : <span className="italic text-slate-400">Not assigned</span>}
//               </p>
//             </div>
//             <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 transition-transform duration-300 rounded-full"
//               style={{ background: `${step.color}15`, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
//               <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//                 <path d="M2 4l4 4 4-4" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
//               </svg>
//             </div>
//           </div>
//         </button>
//         <AnimatePresence>
//           {expanded && (
//             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
//               <div className="p-3 mx-1 mt-1 border rounded-xl" style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>
//                 {user ? (
//                   <div className="flex items-center gap-2 mb-3">
//                     <div className="flex items-center justify-center flex-shrink-0 text-sm font-bold text-white w-9 h-9 rounded-xl"
//                       style={{ background: `linear-gradient(135deg,${step.color},${step.color}99)` }}>
//                       {user.charAt(0).toUpperCase()}
//                     </div>
//                     <div>
//                       <span className="font-black tracking-wide uppercase text-emerald-600" style={{ fontSize: "9px" }}>● Current</span>
//                       <p className="text-sm font-bold leading-tight text-slate-800">{user}</p>
//                       <p className="text-xs text-slate-400 mt-0.5">{step.label}</p>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="p-2 mb-3 text-xs text-center border rounded-lg bg-slate-50 border-slate-200 text-slate-400">
//                     No PR user assigned for this plant.
//                   </div>
//                 )}
//                 <PreviousUserBadge prevLog={prevLog ?? null} color={step.color} />

//                 {!actionMode && (
//                   <div className="flex gap-2 mb-2">
//                     <button onClick={() => setActionMode("add")}
//                       className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
//                       style={{ background: `linear-gradient(135deg,${step.color},${step.color}cc)` }}>
//                       <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//                         <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
//                       </svg>
//                       Newly Add
//                     </button>
//                     {user && (
//                       <button onClick={() => setActionMode("change")}
//                         className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
//                         style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
//                         <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
//                           <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15H2v-3L11.5 2.5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                         </svg>
//                         Change
//                       </button>
//                     )}
//                     {user && (
//                       <button onClick={() => setActionMode("delete")}
//                         className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
//                         style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
//                         <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//                           <path d="M2 3h8M5 1h2M4 3v7M8 3v7M2 3l1 8h6l1-8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                         </svg>
//                       </button>
//                     )}
//                   </div>
//                 )}
//                 {actionMode === "add" && (
//                   <div>
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-xs font-bold" style={{ color: step.color }}>Newly Add</span>
//                       <button onClick={() => setActionMode(null)} className="text-xs text-slate-400 hover:text-slate-600">← back</button>
//                     </div>
//                     <ReplaceForm step={step} currentValue=""
//                       onReplace={(data) => { onReplace("PR_USR", data); setActionMode(null); }} />
//                   </div>
//                 )}
//                 {actionMode === "change" && (
//                   <div>
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-xs font-bold" style={{ color: "#f59e0b" }}>Change PR User</span>
//                       <button onClick={() => setActionMode(null)} className="text-xs text-slate-400 hover:text-slate-600">← back</button>
//                     </div>
//                     <ReplaceForm step={{ ...step, color: "#f59e0b" }} currentValue={user}
//                       onReplace={(data) => { onReplace("PR_USR", data); setActionMode(null); }} />
//                   </div>
//                 )}
//                 {actionMode === "delete" && (
//                   <div>
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-xs font-bold text-red-600">Delete PR User</span>
//                       <button onClick={() => setActionMode(null)} className="text-xs text-slate-400 hover:text-slate-600">← back</button>
//                     </div>
//                     <DeleteConfirm step={step} currentUser={user}
//                       onDelete={() => onDelete("PR_USR")} onCancel={() => setActionMode(null)} />
//                   </div>
//                 )}

//                 {/* CC Emails for PR User */}
//                 <PositionCCEmails
//                   positionKey="PR_USR"
//                   ccValue={indentUsers?.[CC_KEY_MAP["PR_USR"]] ?? ""}
//                   step={step}
//                   onAddEmail={onAddCCEmail}
//                   onReplaceEmail={onReplaceCCEmail}
//                   onDeleteEmail={onDeleteCCEmail}
//                   emailLog={emailLogs?.[CC_KEY_MAP["PR_USR"]] ?? null}
//                 />
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>
//     </div>
//   );
// }

// // ─── MULTI-EMAIL CARDS GROUP ──────────────────────────────────────────────────
// function MultiEmailCards({ step, rawValue, onReplaceEmail, onDeleteEmail, onAddEmail, emailLog }) {
//   const [emailEditOpen, setEmailEditOpen] = useState(false);
//   const emails = parseEmails(rawValue);

//   return (
//     <div className="w-full min-w-0">
//       <button onClick={() => setEmailEditOpen(!emailEditOpen)} className="w-full group">
//         <div className="flex items-center gap-2 px-3 py-2 transition-all duration-300 border-2 cursor-pointer rounded-xl hover:shadow-md"
//           style={{
//             borderColor: emailEditOpen ? step.color : `${step.color}30`,
//             background: emailEditOpen ? `linear-gradient(135deg,${step.color}15,${step.color}08)` : `${step.color}05`,
//             boxShadow: emailEditOpen ? `0 2px 12px ${step.color}20` : "none",
//             borderStyle: "dashed",
//           }}>
//           <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm transition-transform rounded-lg group-hover:scale-110"
//             style={{ background: `${step.color}20` }}>{step.icon}</div>
//           <div className="flex-1 min-w-0 text-left">
//             <div className="flex items-center gap-1.5">
//               <p className="font-bold uppercase truncate" style={{ color: step.color, fontSize: "10px", letterSpacing: "0.08em" }}>
//                 {step.label}
//               </p>
//               <span className="px-1.5 py-0.5 rounded-md font-bold flex-shrink-0"
//                 style={{ fontSize: "9px", background: `${step.color}15`, color: step.color }}>INFO</span>
//               {/* History dot */}
//               {emailLog && (
//                 <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
//                   style={{ background: step.color, opacity: 0.5 }} title="Has email history" />
//               )}
//             </div>
//             <p className="text-xs font-semibold leading-tight truncate text-slate-800">
//               {emails.length === 0
//                 ? <span className="italic text-slate-400">No emails assigned</span>
//                 : emails.length === 1 ? emails[0] : `${emails.length} emails configured`}
//             </p>
//           </div>
//           <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 transition-transform duration-300 rounded-full"
//             style={{ background: `${step.color}15`, transform: emailEditOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
//             <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//               <path d="M2 4l4 4 4-4" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
//             </svg>
//           </div>
//         </div>
//       </button>
//       <AnimatePresence>
//         {emailEditOpen && (
//           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
//             {/* ── Global email history badge ── */}
//             <div className="mt-2">
//               <PreviousEmailBadge prevLog={emailLog ?? null} color={step.color} />
//             </div>
//             <EmailEditPanel step={step} emailSlots={emails}
//               onReplace={onReplaceEmail} onDelete={onDeleteEmail}
//               onAddNew={onAddEmail} onClose={() => setEmailEditOpen(false)} />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ─── OVERVIEW TABLE ───────────────────────────────────────────────────────────
// const TABLE_COLS = [
//   { key: "PLANT_CODE", label: "Plant", color: "#1e293b" },
//   { key: "RAISER", label: "Raiser", color: "#3b82f6" },
//   { key: "PM", label: "PM", color: "#8b5cf6" },
//   { key: "PRJ_INCHARGE", label: "Prj. Incharge", color: "#ef4444" },
//   { key: "PLANNING_QS", label: "Planning & QS", color: "#f59e0b" },
//   { key: "PRJ_HEAD", label: "Project Head", color: "#ec4899" },
//   { key: "PRESIDENT_PRJ", label: "President (Prj)", color: "#6366f1" },
//   { key: "PRESIDENT", label: "President", color: "#6366f1" },
//   { key: "DIRECTOR_PRJ", label: "Director", color: "#0891b2" },
//   { key: "SP_VALUE", label: "SP Value", color: "#84cc16" },
//   { key: "EVC", label: "EVC", color: "#10b981" },
//   { key: "PR_USR", label: "PR User", color: "#0891b2" },
//   { key: "EMAILS", label: "Emails", color: "#84cc16" },
// ];
// const DATA_COLS = TABLE_COLS.filter(c => c.key !== "PLANT_CODE");

// function OverviewTable({ plantOptions, typeColorMap, authHeaders }) {
//   const [bulkData, setBulkData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [loadError, setLoadError] = useState(null);
//   const [searchCode, setSearchCode] = useState("");
//   const [filterType, setFilterType] = useState("ALL");
//   const hasFetched = useRef(false);

//   const TYPE_ORDER = ["HO", "PROJECTS", "RMC", "MAINTAIN", "COMM.PROJ.", "COMM.MAIN.", "PRECAST", "CENT.YARD"];
//   const rawTypes = [...new Set(plantOptions.map((p) => p.TYPE?.trim()).filter(Boolean))];
//   const uniqueTypes = [
//     ...TYPE_ORDER.filter((t) => rawTypes.includes(t)),
//     ...rawTypes.filter((t) => !TYPE_ORDER.includes(t)).sort(),
//   ];
//   const filteredPlants = plantOptions.filter(
//     (p) => (filterType === "ALL" || p.TYPE === filterType) &&
//       (searchCode === "" || String(p.WERKS).toLowerCase().includes(searchCode.toLowerCase()))
//   );
//   const getTypeColor = (type) => typeColorMap[type] ?? "#64748b";

//   const fetchBulk = async () => {
//     setLoading(true); setLoadError(null);
//     try {
//       const res = await fetch(`${API_BASE_URL}indent-plant-users-bulk`, { headers: authHeaders() });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();
//       setBulkData(json.data || {});
//     } catch (err) { setLoadError("Failed to load indent users. " + err.message); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => {
//     if (plantOptions.length > 0 && !hasFetched.current) { hasFetched.current = true; fetchBulk(); }
//   }, [plantOptions]);

//   const getRow = (werks) => bulkData ? (bulkData[String(werks)] ?? {}) : null;

//   return (
//     <div className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200">
//       <div className="relative px-6 py-4 overflow-hidden"
//         style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%)" }}>
//         <div className="absolute w-32 h-32 rounded-full -top-6 -right-6 opacity-10"
//           style={{ background: "radial-gradient(circle,#818cf8,transparent)" }} />
//         <div className="flex items-center justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl"
//               style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                 <path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
//               </svg>
//             </div>
//             <div>
//               <h2 className="text-base font-black tracking-tight text-white">Indent Users Overview</h2>
//               <p className="text-xs mt-0.5" style={{ color: "#93c5fd" }}>Plant-wise indent approval users from ZMM plant data</p>
//             </div>
//           </div>
//           <button
//             onClick={() => {
//               if (!bulkData) return;
//               const headers = TABLE_COLS.map(c => c.label);
//               const rows = filteredPlants.map((p) => {
//                 const row = getRow(p.WERKS) ?? {};
//                 return [p.WERKS, ...DATA_COLS.map((c) => row[c.key] ?? "")];
//               });
//               const csv = [headers, ...rows].map(r =>
//                 r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")
//               ).join("\n");
//               const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//               const url = URL.createObjectURL(blob);
//               const a = document.createElement("a");
//               a.href = url; a.download = `indent-users-${new Date().toISOString().split("T")[0]}.csv`;
//               a.click(); URL.revokeObjectURL(url);
//             }}
//             disabled={!bulkData || loading}
//             className="flex items-center flex-shrink-0 gap-2 px-4 py-2 text-xs font-bold transition-all rounded-xl hover:shadow-lg disabled:opacity-40"
//             style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.4)" }}>
//             {loading ? "Loading…" : "⬇ Download"}
//           </button>
//         </div>
//       </div>
//       <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 flex-wrap">
//         <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
//           className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg bg-white focus:outline-none cursor-pointer"
//           style={{ border: `1.5px solid ${filterType !== "ALL" ? getTypeColor(filterType) : "#e2e8f0"}`, color: filterType !== "ALL" ? getTypeColor(filterType) : "#475569", minWidth: "140px" }}>
//           <option value="ALL">🏭 All Types ({plantOptions.length})</option>
//           {uniqueTypes.map((t) => (
//             <option key={t} value={t}>{t} ({plantOptions.filter(p => p.TYPE === t).length})</option>
//           ))}
//         </select>
//         <input type="text" value={searchCode} onChange={(e) => setSearchCode(e.target.value)}
//           placeholder="Plant code…"
//           className="pl-3 pr-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none border border-slate-200 bg-white focus:border-blue-300"
//           style={{ width: "120px", color: "#1e293b" }} />
//       </div>
//       {loadError && (
//         <div className="flex items-center justify-between gap-3 p-3 mx-4 my-3 border border-red-200 rounded-2xl bg-red-50">
//           <p className="text-xs font-semibold text-red-700">{loadError}</p>
//           <button onClick={() => { hasFetched.current = false; fetchBulk(); }}
//             className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl">Retry</button>
//         </div>
//       )}
//       {loading && !bulkData && (
//         <div className="px-4 py-6 space-y-2">
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className="flex gap-3">
//               {TABLE_COLS.map((c) => <div key={c.key} className="flex-1 h-4 rounded animate-pulse bg-slate-100" />)}
//             </div>
//           ))}
//         </div>
//       )}
//       {(bulkData || (!loading && !loadError)) && (
//         <div className="overflow-auto" style={{ maxHeight: "520px", border: "2px solid #cbd5e1", borderRadius: "0 0 20px 20px" }}>
//           <table className="w-full text-left" style={{ minWidth: "1100px", borderCollapse: "collapse", borderSpacing: 0 }}>
//             <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
//               <tr style={{ background: "#f8fafc" }}>
//                 {TABLE_COLS.map((col) => (
//                   <th key={col.key} className="px-3 py-2.5 text-left whitespace-nowrap"
//                     style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.07em", color: col.color, background: "#f8fafc", border: "1.5px solid #cbd5e1", borderBottom: "2.5px solid #94a3b8" }}>
//                     <span className="uppercase">{col.label}</span>
//                     {(col.key === "PR_USR" || col.key === "EMAILS") && (
//                       <span className="ml-1 px-1 py-0.5 rounded text-white" style={{ fontSize: "8px", background: col.color }}>INFO</span>
//                     )}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredPlants.length === 0 ? (
//                 <tr><td colSpan={TABLE_COLS.length} className="py-10 text-sm text-center text-slate-400">No plants match the filter.</td></tr>
//               ) : filteredPlants.map((p, idx) => {
//                 const row = getRow(p.WERKS);
//                 const typeColor = getTypeColor(p.TYPE);
//                 return (
//                   <motion.tr key={p.WERKS} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//                     transition={{ delay: Math.min(idx * 0.006, 0.2) }}
//                     style={{ background: idx % 2 === 0 ? "white" : "#fafafa" }}
//                     className="transition-colors duration-100 hover:bg-blue-50">
//                     <td className="px-3 py-2" style={{ border: "1.5px solid #cbd5e1", borderLeft: `3px solid ${typeColor}` }}>
//                       <div className="flex flex-col gap-0.5">
//                         <span className="text-xs font-black" style={{ color: typeColor }}>{p.WERKS}</span>
//                         <span style={{ fontSize: "9px", fontWeight: 700, color: typeColor }}>{p.TYPE}</span>
//                         <span className="text-xs truncate text-slate-500" style={{ maxWidth: "100px" }}>{p.NAME1}</span>
//                       </div>
//                     </td>
//                     {DATA_COLS.map((col) => (
//                       <td key={col.key} className="px-3 py-2" style={{ border: "1.5px solid #cbd5e1" }}>
//                         {!row ? (
//                           <div className="h-3 rounded w-14 animate-pulse bg-slate-100" />
//                         ) : row[col.key] && row[col.key] !== "NULL" ? (
//                           col.key === "EMAILS" ? (
//                             <div className="flex flex-col gap-0.5">
//                               {parseEmails(row[col.key]).map((em, ei) => (
//                                 <span key={ei} className="text-xs font-semibold truncate text-slate-700"
//                                   style={{ maxWidth: "160px", display: "block" }}>{em}</span>
//                               ))}
//                             </div>
//                           ) : (
//                             <span className="text-xs font-semibold text-slate-800">{row[col.key]}</span>
//                           )
//                         ) : (
//                           <span className="italic text-slate-600" style={{ fontSize: "12px" }}>skip</span>
//                         )}
//                       </td>
//                     ))}
//                   </motion.tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}
//       <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between">
//         <p className="text-xs text-slate-400">
//           Showing <strong className="text-slate-600">{filteredPlants.length}</strong> of{" "}
//           <strong className="text-slate-600">{plantOptions.length}</strong> plants
//         </p>
//         <button onClick={() => { hasFetched.current = false; fetchBulk(); }} disabled={loading}
//           className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:shadow-md disabled:opacity-40"
//           style={{ background: "#6366f110", color: "#6366f1", border: "1px solid #6366f130" }}>
//           <svg className={loading ? "animate-spin" : ""} width="10" height="10" viewBox="0 0 24 24" fill="none">
//             <path d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0 1 15.66-3M20 15a9 9 0 0 1-15.66 3" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
//           </svg>
//           Refresh
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── FLOW LEGEND ──────────────────────────────────────────────────────────────
// function FlowLegend() {
//   const flowBadge = {
//     PROJECTS: { label: "Projects", bg: "#3b82f615", border: "#3b82f6", text: "#3b82f6" },
//     RMC: { label: "RMC", bg: "#10b98115", border: "#10b981", text: "#10b981" },
//     MAINTENANCE: { label: "Maintenance", bg: "#f59e0b15", border: "#f59e0b", text: "#f59e0b" },
//     PM: { label: "PM", bg: "#8b5cf615", border: "#8b5cf6", text: "#8b5cf6" },
//     SAFETY: { label: "Safety", bg: "#f9731615", border: "#f97316", text: "#c2410c" },
//   };
//   const legends = [
//     { type: "PROJECTS", steps: FLOW_STEPS.PROJECTS, desc: "Projects & RMC plants" },
//     { type: "MAINTENANCE", steps: FLOW_STEPS.MAINTENANCE, desc: "Maintenance plants" },
//     { type: "SAFETY", steps: FLOW_STEPS.SAFETY, desc: "When Safety is selected" },
//     { type: "PM", steps: FLOW_STEPS.PM, desc: "When PM is selected" },
//   ];
//   const LEGEND_INFO_FIELDS = [{ key: "PR_USR", label: "PR User", icon: "👤", color: "#0891b2" }];

//   return (
//     <div className="p-5 bg-white border shadow-sm rounded-3xl border-slate-200">
//       <h3 className="mb-4 text-sm font-bold tracking-wide uppercase text-slate-700">Indent Flow Reference</h3>
//       <div className="flex flex-col gap-3">
//         {legends.map(({ type, steps, desc }) => {
//           const badge = flowBadge[type];
//           return (
//             <div key={type} className="flex items-start gap-4 p-3 border rounded-2xl"
//               style={{ borderColor: badge.border + "40", background: badge.bg }}>
//               <div className="flex-shrink-0 w-40">
//                 <p className="text-xs font-black tracking-wide uppercase" style={{ color: badge.text }}>{badge.label}</p>
//                 <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
//               </div>
//               <div className="self-stretch flex-shrink-0 w-px" style={{ background: badge.border + "40" }} />
//               <div className="flex flex-wrap items-center flex-1 gap-1">
//                 {steps.map((step, i) => (
//                   <div key={step.key} className="flex items-center gap-1">
//                     <div className="px-2 py-1 text-xs font-bold text-white rounded-lg" style={{ background: step.color }}>
//                       {step.label}
//                     </div>
//                     {i < steps.length - 1 && (
//                       <svg width="14" height="10" viewBox="0 0 16 12" fill="none">
//                         <path d="M0 6h12M8 1l7 5-7 5" stroke={badge.border} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                       </svg>
//                     )}
//                   </div>
//                 ))}
//                 <div className="flex items-center gap-1 pl-2 ml-2 border-l-2 border-dashed border-slate-200">
//                   {LEGEND_INFO_FIELDS.map((f) => (
//                     <div key={f.key} className="px-2 py-1 text-xs font-semibold border rounded-lg"
//                       style={{ color: f.color, borderColor: `${f.color}40`, background: `${f.color}10` }}>
//                       {f.label}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//       <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
//         <span className="inline-block w-6 h-px border-t-2 border-dashed border-slate-300" />
//         Dashed-border fields (PR User) are informational only — not part of approval chain.
//       </p>
//     </div>
//   );
// }

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// export default function Indents() {
//   const navigate = useNavigate();

//   const [selectedPlant, setSelectedPlant] = useState("");
//   const [selectedDropdown, setSelectedDropdown] = useState("PROJECTS");
//   const [filterType, setFilterType] = useState("ALL");
//   const [replacements, setReplacements] = useState({});
//   const [toastMsg, setToastMsg] = useState(null);
//   const [toastError, setToastError] = useState(false);

//   const [plantOptions, setPlantOptions] = useState([]);
//   const [loadingPlants, setLoadingPlants] = useState(true);
//   const [plantError, setPlantError] = useState(null);

//   const [indentUsers, setIndentUsers] = useState({});
//   const [loadingUsers, setLoadingUsers] = useState(false);
//   const [usersError, setUsersError] = useState(null);

//   const [positionLogs, setPositionLogs] = useState({});
//   const [emailLogs, setEmailLogs] = useState({});       // ← NEW
//   const [loadingLogs, setLoadingLogs] = useState(false);

//   const prevPlantRef = useRef("");

//   const getToken = () => { try { return JSON.parse(localStorage.getItem("userInfo"))?.token ?? null; } catch { return null; } };
//   const authHeaders = () => ({ "Content-Type": "application/json", Accept: "application/json", ...(getToken() && { Authorization: `Bearer ${getToken()}` }) });
//   const showToast = (msg, isError = false) => { setToastMsg(msg); setToastError(isError); setTimeout(() => setToastMsg(null), 4000); };

//   const fetchPlants = async () => {
//     setLoadingPlants(true); setPlantError(null);
//     try {
//       const res = await fetch(`${API_BASE_URL}get-plant-details-auth?status=ACTIVE`, { headers: authHeaders() });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();
//       setPlantOptions(json.data || []);
//     } catch { setPlantError("Failed to load plants from SAP."); }
//     finally { setLoadingPlants(false); }
//   };

//   const fetchIndentUsers = async (plantCode) => {
//     setLoadingUsers(true); setUsersError(null); setIndentUsers({});
//     try {
//       const res = await fetch(`${API_BASE_URL}indent-plant-users?plant=${plantCode}`, { headers: authHeaders() });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();
//       setIndentUsers(json.data || {});
//     } catch { setUsersError("Could not load indent users for this plant."); }
//     finally { setLoadingUsers(false); }
//   };

//   // ── Updated fetchPositionLogs — now captures email_logs too ──
//  const fetchPositionLogs = async (plantCode) => {
//     setLoadingLogs(true);
//     try {
//       const res = await fetch(`${API_BASE_URL}indent-position-logs?plant=${plantCode}`, { headers: authHeaders() });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();
//       setPositionLogs(json.data || {});
//       const eLogs = json.email_logs || {};
//       setEmailLogs(eLogs);
//       // Sync current CC email values from logs into indentUsers
//       if (Object.keys(eLogs).length > 0) {
//         setIndentUsers(prev => {
//           const patch = {};
//           Object.entries(eLogs).forEach(([ccKey, logEntry]) => {
//             if ((!prev[ccKey] || prev[ccKey] === "NULL") && logEntry?.CURRENT_EMAIL) {
//               patch[ccKey] = logEntry.CURRENT_EMAIL;
//             }
//           });
//           return Object.keys(patch).length > 0 ? { ...prev, ...patch } : prev;
//         });
//       }
//     } catch {
//       setPositionLogs({});
//       setEmailLogs({});
//     }
//     finally { setLoadingLogs(false); }
//   };

//   useEffect(() => { fetchPlants(); }, []);

//   useEffect(() => {
//     if (!selectedPlant) {
//       setIndentUsers({}); setUsersError(null);
//       setPositionLogs({}); setEmailLogs({});   // ← clear both on deselect
//       return;
//     }
//     const plantChanged = prevPlantRef.current !== selectedPlant;
//     prevPlantRef.current = selectedPlant;
//     if (plantChanged) {
//       setReplacements({});
//       setEmailLogs({});                         // ← clear on plant change
//       fetchPositionLogs(selectedPlant.slice(0, 4));
//     }
//     fetchIndentUsers(selectedPlant.slice(0, 4));
//   }, [selectedPlant]);

//   // ── Standard Handlers ──
//   const handleReplace = async (roleKey, data) => {
//     const res = await fetch(`${API_BASE_URL}indent-position-change`, {
//       method: "POST", headers: authHeaders(),
//       body: JSON.stringify({ plant: selectedPlant, position_key: roleKey, new_username: data.username, new_name: data.name, new_emp_id: data.emp_id, applicable_date: data.date, flow_type: selectedDropdown }),
//     });
//     const json = await res.json();
//     if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
//     setReplacements((prev) => ({ ...prev, [roleKey]: data }));
//     showToast(json.applied_now ? `${roleKey} → ${data.name} applied ✓` : `${roleKey} → ${data.name} scheduled for ${data.date} ✓`);
//     if (json.applied_now) { fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4)); }
//   };

//   const handleDelete = async (roleKey) => {
//     const res = await fetch(`${API_BASE_URL}indent-position-change`, {
//       method: "POST", headers: authHeaders(),
//       body: JSON.stringify({ plant: selectedPlant, position_key: roleKey, new_username: null, new_name: null, new_emp_id: null, applicable_date: new Date().toLocaleDateString("en-CA"), flow_type: selectedDropdown, action: "DELETE" }),
//     });
//     const json = await res.json();
//     if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
//     showToast(`${roleKey} removed ✓`);
//     fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4));
//   };

//   const handleAddNewRaiser = async (data) => {
//     const currentRaisers = parseRaisers(indentUsers["RAISER"] ?? "");
//     const newRaisersStr = [...currentRaisers, data.username].join(",");
//     const res = await fetch(`${API_BASE_URL}indent-position-change`, {
//       method: "POST", headers: authHeaders(),
//       body: JSON.stringify({ plant: selectedPlant, position_key: "RAISER", new_username: newRaisersStr, new_name: data.name, new_emp_id: data.emp_id, applicable_date: data.date, flow_type: selectedDropdown, action: "ADD_RAISER" }),
//     });
//     const json = await res.json();
//     if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
//     showToast(`New raiser ${data.name} added ✓`);
//     fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4));
//   };

//   const handleReplacePrUser = async (roleKey, data) => {
//     const res = await fetch(`${API_BASE_URL}indent-position-change`, {
//       method: "POST", headers: authHeaders(),
//       body: JSON.stringify({ plant: selectedPlant, position_key: "PR_USR", new_username: data.username, new_name: data.name, new_emp_id: data.emp_id, applicable_date: data.date, flow_type: selectedDropdown }),
//     });
//     const json = await res.json();
//     if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
//     setReplacements((prev) => ({ ...prev, PR_USR: data }));
//     showToast(json.applied_now ? `PR User → ${data.name} applied ✓` : `PR User → ${data.name} scheduled ✓`);
//     if (json.applied_now) { fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4)); }
//   };

//   // ── Global Email CC Handlers ──
//   const handleReplaceEmail = async (emailIndex, data) => {
//     const currentRaw = indentUsers["EMAILS"] ?? "";
//     const emails = parseEmails(currentRaw);
//     emails[emailIndex] = data.username;
//     const res = await fetch(`${API_BASE_URL}indent-position-change`, {
//       method: "POST", headers: authHeaders(),
//       body: JSON.stringify({ plant: selectedPlant, position_key: "EMAILS", new_email: emails.join(","), new_name: data.name, new_emp_id: data.emp_id, applicable_date: data.date, flow_type: selectedDropdown }),
//     });
//     const json = await res.json();
//     if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
//     showToast(`Email slot ${emailIndex + 1} updated ✓`);
//     if (json.applied_now) { fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4)); }
//   };

//   const handleDeleteEmail = async (emailIndex) => {
//     const emails = parseEmails(indentUsers["EMAILS"] ?? "");
//     emails.splice(emailIndex, 1);
//     const res = await fetch(`${API_BASE_URL}indent-position-change`, {
//       method: "POST", headers: authHeaders(),
//       body: JSON.stringify({ plant: selectedPlant, position_key: "EMAILS", new_email: emails.join(",") || null, new_name: null, new_emp_id: null, applicable_date: new Date().toLocaleDateString("en-CA"), flow_type: selectedDropdown, action: "DELETE_EMAIL" }),
//     });
//     const json = await res.json();
//     if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
//     showToast(`Email removed ✓`);
//     fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4));
//   };

//   const handleAddEmail = async (data) => {
//     const emails = parseEmails(indentUsers["EMAILS"] ?? "");
//     emails.push(data.username);
//     const res = await fetch(`${API_BASE_URL}indent-position-change`, {
//       method: "POST", headers: authHeaders(),
//       body: JSON.stringify({ plant: selectedPlant, position_key: "EMAILS", new_email: emails.join(","), new_name: data.name, new_emp_id: data.emp_id, applicable_date: data.date, flow_type: selectedDropdown, action: "ADD_EMAIL" }),
//     });
//     const json = await res.json();
//     if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
//     showToast(`Email added ✓`);
//     fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4));
//   };

//   // ── Per-Position CC Email Handlers ──
//   const handleAddCCEmail = async (ccKey, data) => {
//     const emails = parseEmails(indentUsers[ccKey] ?? "");
//     emails.push(data.username);
//     const res = await fetch(`${API_BASE_URL}indent-position-change`, {
//       method: "POST", headers: authHeaders(),
//       body: JSON.stringify({ plant: selectedPlant, position_key: ccKey, new_email: emails.join(","), new_name: data.name, new_emp_id: data.emp_id, applicable_date: data.date, flow_type: selectedDropdown, action: "ADD_EMAIL" }),
//     });
//     const json = await res.json();
//     if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
//     showToast(`CC email added to ${ccKey} ✓`);
//     fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4));
//   };

//   const handleReplaceCCEmail = async (ccKey, emailIndex, data) => {
//     const emails = parseEmails(indentUsers[ccKey] ?? "");
//     emails[emailIndex] = data.username;
//     const res = await fetch(`${API_BASE_URL}indent-position-change`, {
//       method: "POST", headers: authHeaders(),
//       body: JSON.stringify({ plant: selectedPlant, position_key: ccKey, new_email: emails.join(","), new_name: data.name, new_emp_id: data.emp_id, applicable_date: data.date, flow_type: selectedDropdown }),
//     });
//     const json = await res.json();
//     if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
//     showToast(`CC email updated ✓`);
//     fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4));
//   };

//   const handleDeleteCCEmail = async (ccKey, emailIndex) => {
//     const emails = parseEmails(indentUsers[ccKey] ?? "");
//     emails.splice(emailIndex, 1);
//     const res = await fetch(`${API_BASE_URL}indent-position-change`, {
//       method: "POST", headers: authHeaders(),
//       body: JSON.stringify({ plant: selectedPlant, position_key: ccKey, new_email: emails.join(",") || null, new_name: null, new_emp_id: null, applicable_date: new Date().toLocaleDateString("en-CA"), flow_type: selectedDropdown, action: "DELETE_EMAIL" }),
//     });
//     const json = await res.json();
//     if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
//     showToast(`CC email removed ✓`);
//     fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4));
//   };

//   const plant = plantOptions.find((p) => p.WERKS === selectedPlant);
//   const plantType = plant?.TYPE ?? "";
//   const flowType = getFlowType(plantType, selectedDropdown);
//   const flowSteps = FLOW_STEPS[flowType] ?? FLOW_STEPS.PROJECTS;
//   const getUserVal = (key) => { const v = indentUsers[key]; return v && v !== "NULL" ? v : null; };

//   const TYPE_ORDER = ["HO", "PROJECTS", "RMC", "MAINTAIN", "COMM.PROJ.", "COMM.MAIN.", "PRECAST", "CENT.YARD"];
//   const rawTypes = [...new Set(plantOptions.map((p) => p.TYPE?.trim()).filter(Boolean))];
//   const uniqueTypes = [...TYPE_ORDER.filter((t) => rawTypes.includes(t)), ...rawTypes.filter((t) => !TYPE_ORDER.includes(t)).sort()];
//   const typeColorMap = Object.fromEntries(uniqueTypes.map((t, i) => [t, TYPE_PALETTE[i % TYPE_PALETTE.length]]));
//   const getTypeColor = (type) => typeColorMap[type] ?? "#64748b";
//   const filteredPlants = plantOptions.filter((p) => filterType === "ALL" || p.TYPE === filterType);

//   const flowBadgeColors = {
//     PROJECTS: { border: "#3b82f6", bg: "#eff6ff", text: "#1d4ed8" },
//     RMC: { border: "#10b981", bg: "#ecfdf5", text: "#065f46" },
//     MAINTENANCE: { border: "#f59e0b", bg: "#fffbeb", text: "#92400e" },
//     PM: { border: "#8b5cf6", bg: "#f5f3ff", text: "#6d28d9" },
//     SAFETY: { border: "#f97316", bg: "#fff7ed", text: "#c2410c" },
//   };
//   const activeBadge = flowBadgeColors[flowType] ?? flowBadgeColors.PROJECTS;

//   const tabList = [
//     { key: "ALL", label: "All Plants", count: plantOptions.length },
//     ...uniqueTypes.map((t) => ({ key: t, label: t, count: plantOptions.filter((p) => p.TYPE === t).length }))
//   ];

//   const handleSelectPlant = (werks) => setSelectedPlant(werks);
//   const handleClear = () => {
//     setSelectedPlant(""); setReplacements({});
//     setPositionLogs({}); setEmailLogs({});   // ← clear both
//     prevPlantRef.current = "";
//   };

//   const PR_USR_STEP = { key: "PR_USR", label: "PR User", icon: "👤", color: "#0891b2" };
//   const EMAILS_STEP = { key: "EMAILS", label: "Email CC", icon: "📧", color: "#84cc16" };

//   // ── ccProps now includes emailLogs ──
//   const ccProps = {
//     indentUsers,
//     onAddCCEmail: handleAddCCEmail,
//     onReplaceCCEmail: handleReplaceCCEmail,
//     onDeleteCCEmail: handleDeleteCCEmail,
//     emailLogs,   // ← NEW
//   };

//   return (
//     <div className="min-h-screen" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
//       <div className="px-6 py-8 mx-auto space-y-6 max-w-7xl">

//         <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
//           whileHover={{ scale: 1.02, x: -2 }} whileTap={{ scale: 0.97 }}
//           onClick={() => navigate("/mrfauthorize")}
//           className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-xl hover:shadow-md"
//           style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
//           <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
//             <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//           Back to Authorization
//         </motion.button>

//         {/* ── Plant Selection Card ── */}
//         <div className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200">
//           <div className="relative overflow-hidden"
//             style={{ background: "linear-gradient(135deg,#0f172a 0%,#312e81 60%,#4f46e5 100%)" }}>
//             <div className="absolute w-32 h-32 rounded-full -top-6 -right-6 opacity-10"
//               style={{ background: "radial-gradient(circle,#a78bfa,transparent)" }} />
//             <div className="relative flex items-center justify-between gap-4 px-6 py-4">
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl"
//                   style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                     <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                     <rect x="9" y="3" width="6" height="4" rx="1" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                     <path d="M9 12h6M9 16h4" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h1 className="text-lg font-black tracking-tight text-white">Indent Authorization</h1>
//                   <p className="text-xs mt-0.5" style={{ color: "#c4b5fd" }}>Select plant, then choose Projects or PM flow</p>
//                 </div>
//               </div>
//               <div className="flex items-center flex-shrink-0 gap-3">
//                 {!loadingPlants && !plantError && (
//                   <div className="text-right">
//                     <p className="text-2xl font-black leading-none text-white">{plantOptions.length}</p>
//                     <p className="text-xs font-medium mt-0.5" style={{ color: "#c4b5fd" }}>active plants</p>
//                   </div>
//                 )}
//                 {selectedPlant && (
//                   <button onClick={handleClear} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
//                     style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
//                     <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//                       <path d="M1 1l10 10M11 1L1 11" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
//                     </svg>
//                     Clear
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           {loadingPlants && (
//             <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-400">
//               <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
//                 <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
//                 <path d="M12 2a10 10 0 0 1 10 10" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
//               </svg>
//               Loading active plants from SAP…
//             </div>
//           )}
//           {plantError && !loadingPlants && (
//             <div className="flex items-center justify-between gap-4 p-4 m-4 border border-red-200 rounded-2xl bg-red-50">
//               <p className="text-sm font-semibold text-red-700">{plantError}</p>
//               <button onClick={fetchPlants} className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-xl">Retry</button>
//             </div>
//           )}

//           {!loadingPlants && !plantError && (
//             <>
//               <div className="flex items-center gap-3 px-4 pt-3 pb-2">
//                 <div className="flex gap-1.5 overflow-x-auto flex-1" style={{ flexWrap: "nowrap", scrollbarWidth: "none" }}>
//                   {tabList.map((tab) => {
//                     const isActive = filterType === tab.key;
//                     const color = tab.key === "ALL" ? "#1e293b" : getTypeColor(tab.key);
//                     return (
//                       <motion.button key={tab.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
//                         onClick={() => { setFilterType(tab.key); handleClear(); }}
//                         className="flex items-center flex-shrink-0 gap-1 transition-all duration-200"
//                         style={{
//                           padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
//                           border: `1.5px solid ${isActive ? color : `${color}35`}`,
//                           background: isActive ? `linear-gradient(135deg, ${color}, ${color}e0)` : `${color}10`,
//                           color: isActive ? "white" : color,
//                           boxShadow: isActive ? `0 2px 8px ${color}35` : "none",
//                         }}>
//                         {tab.label}
//                         <span style={{ marginLeft: "3px", padding: "1px 5px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, background: isActive ? "rgba(255,255,255,0.22)" : `${color}20`, color: isActive ? "white" : color }}>
//                           {tab.count}
//                         </span>
//                       </motion.button>
//                     );
//                   })}
//                 </div>
//               </div>
//               <div className="px-3 pt-1 pb-3 overflow-y-auto" style={{ maxHeight: "220px" }}>
//                 <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
//                   {filteredPlants.length === 0 ? (
//                     <p className="py-8 text-xs text-center col-span-full text-slate-400">No active plants found for this type.</p>
//                   ) : filteredPlants.map((p) => {
//                     const isSelected = selectedPlant === p.WERKS;
//                     const typeColor = getTypeColor(p.TYPE);
//                     return (
//                       <motion.button key={p.WERKS} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
//                         onClick={() => handleSelectPlant(p.WERKS)} className="text-left transition-all duration-200 border-2"
//                         style={{
//                           padding: "6px 10px", borderRadius: "8px",
//                           borderColor: isSelected ? typeColor : `${typeColor}30`,
//                           background: isSelected ? `linear-gradient(135deg, ${typeColor}18, ${typeColor}08)` : `${typeColor}07`,
//                           boxShadow: isSelected ? `0 2px 10px ${typeColor}25` : "none",
//                         }}>
//                         <div className="flex items-center justify-between gap-1 mb-1">
//                           <span style={{ fontSize: "9px", fontWeight: 800, color: typeColor, maxWidth: "70px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.TYPE}</span>
//                           <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "4px", background: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}30` }}>
//                             {p.TYPE?.toUpperCase().includes("MAINT") ? "MNT" : p.TYPE?.toUpperCase().includes("RMC") ? "RMC" : "PRJ"}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-1.5 min-w-0">
//                           <span style={{ fontSize: "12px", fontWeight: 900, flexShrink: 0, color: isSelected ? typeColor : "#1e293b" }}>{p.WERKS}</span>
//                           <span style={{ fontSize: "10px", fontWeight: 700, color: isSelected ? `${typeColor}bb` : "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.NAME1}</span>
//                         </div>
//                       </motion.button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>

//         {/* ── Flow + Approval Positions ── */}
//         <AnimatePresence mode="wait">
//           {plant && (
//             <motion.div key={selectedPlant} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
//               <div className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200">
//                 <div className="p-5 pb-4">
//                   <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
//                     <div>
//                       <h3 className="text-lg font-black text-slate-900">{plant.WERKS} — {plant.NAME1}</h3>
//                       <p className="text-sm text-slate-500 mt-0.5">{plant.TYPE} · Select approval flow below</p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <label className="text-xs font-bold tracking-wide uppercase text-slate-500">Flow:</label>
//                       <div className="relative">
//                         <select value={selectedDropdown} onChange={(e) => setSelectedDropdown(e.target.value)}
//                           className="py-2 pl-3 pr-8 text-sm font-bold transition-all appearance-none cursor-pointer rounded-xl focus:outline-none"
//                           style={{ border: `2px solid ${activeBadge.border}`, color: activeBadge.text, background: activeBadge.bg, minWidth: "160px" }}>
//                           <option value="PROJECTS"> Projects / RMC</option>
//                           <option value="PM"> PM</option>
//                           <option value="SAFETY"> Safety</option>
//                         </select>
//                         <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
//                           <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//                             <path d="M2 4l4 4 4-4" stroke={activeBadge.text} strokeWidth="2" strokeLinecap="round" />
//                           </svg>
//                         </div>
//                       </div>
//                       <div className="px-3 py-1.5 rounded-xl text-xs font-black border-2"
//                         style={{ borderColor: activeBadge.border, color: activeBadge.text, background: activeBadge.bg }}>
//                         {flowType === "SAFETY" ? "Safety Flow" : flowType === "PM" ? "PM Flow" : flowType === "MAINTENANCE" ? "Maintenance" : flowType === "RMC" ? "RMC Flow" : "Projects Flow"}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="p-3 border rounded-2xl bg-slate-50 border-slate-100">
//                     {loadingUsers ? (
//                       <div className="flex items-center gap-2 text-xs text-slate-400">
//                         <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
//                           <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
//                           <path d="M12 2a10 10 0 0 1 10 10" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
//                         </svg>
//                         Loading flow…
//                       </div>
//                     ) : <FlowDiagram steps={flowSteps} flowType={flowType} />}
//                   </div>
//                 </div>

//                 <div className="border-t border-slate-100">
//                   <div className="px-5 py-2.5 flex items-center gap-2">
//                     <span className="inline-block w-2 h-2 rounded-full" style={{ background: activeBadge.border }} />
//                     <h2 className="text-sm font-bold text-slate-800">Approval Positions</h2>
//                     <span className="flex items-center gap-1 ml-auto text-xs font-normal text-slate-500">
//                       {loadingLogs ? (
//                         <>
//                           <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none">
//                             <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
//                             <path d="M12 2a10 10 0 0 1 10 10" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
//                           </svg>
//                           Loading history…
//                         </>
//                       ) : (
//                         <>
//                           <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
//                             <path d="M8 4v4l2.5 2.5" stroke="#2c2e30" strokeWidth="1.5" strokeLinecap="round" />
//                             <circle cx="8" cy="8" r="6.5" stroke="#2c2e30" strokeWidth="1.5" />
//                           </svg>
//                           Click any position to view history &amp; manage
//                         </>
//                       )}
//                     </span>
//                   </div>
//                 </div>

//                 {loadingUsers && (
//                   <div className="flex items-center justify-center gap-3 py-8 text-sm text-slate-400">
//                     <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
//                       <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
//                       <path d="M12 2a10 10 0 0 1 10 10" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
//                     </svg>
//                     Loading users…
//                   </div>
//                 )}

//                 {usersError && !loadingUsers && (
//                   <div className="flex items-center justify-between gap-3 p-3 mx-4 mb-4 border rounded-2xl bg-amber-50 border-amber-200">
//                     <p className="text-xs font-semibold text-amber-700">{usersError}</p>
//                     <button onClick={() => fetchIndentUsers(selectedPlant.slice(0, 4))}
//                       className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl">Retry</button>
//                   </div>
//                 )}

//                 {!loadingUsers && (
//                   <div className="px-4 pt-1 pb-4 space-y-3">
//                     {flowSteps.length === 0 ? (
//                       <p className="py-6 text-sm text-center text-slate-400">No approval steps configured.</p>
//                     ) : (
//                       <>
//                         {(() => {
//                           const raiserStep = flowSteps.find(s => s.key === "RAISER");
//                           const nonRaiserSteps = flowSteps.filter(s => s.key !== "RAISER");
//                           const raiserSlots = buildRaiserSlots(getUserVal("RAISER"));
//                           return (
//                             <>
//                               {raiserStep && (
//                                 <MultiRaiserCards
//                                   step={raiserStep} stepNumber={1} raiserSlots={raiserSlots}
//                                   onReplace={handleReplace} onDelete={handleDelete}
//                                   onAddNew={handleAddNewRaiser} positionLogs={positionLogs}
//                                   {...ccProps}
//                                 />
//                               )}
//                               {chunkArray(nonRaiserSteps, 2).map((pair, rowIdx) => (
//                                 <div key={rowIdx} className="flex items-start gap-3">
//                                   {pair.map((step) => {
//                                     const stepIndex = flowSteps.findIndex((s) => s.key === step.key);
//                                     return (
//                                       <UserCard
//                                         key={step.key} step={step} stepNumber={stepIndex + 1}
//                                         user={getUserVal(step.key)} onReplace={handleReplace}
//                                         onDelete={handleDelete} isInfoOnly={false}
//                                         prevLog={positionLogs[step.key] ?? null}
//                                         {...ccProps}
//                                       />
//                                     );
//                                   })}
//                                   {pair.length === 1 && <div className="flex-1" />}
//                                 </div>
//                               ))}
//                             </>
//                           );
//                         })()}

//                         {/* Info Only section */}
//                         <div className="flex items-center gap-3 pt-1">
//                           <div className="flex-1 h-px border-t-2 border-dashed border-slate-200" />
//                           <span className="px-2 text-xs font-bold tracking-widest uppercase text-slate-600">
//                             Info Only — Not Approval
//                           </span>
//                           <div className="flex-1 h-px border-t-2 border-dashed border-slate-200" />
//                         </div>
//                         <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
//                           <PrUserCard
//                             step={PR_USR_STEP} user={getUserVal("PR_USR")}
//                             onReplace={handleReplacePrUser} onDelete={handleDelete}
//                             prevLog={positionLogs["PR_USR"] ?? null}
//                             {...ccProps}
//                           />
//                           <MultiEmailCards
//                             step={EMAILS_STEP} rawValue={indentUsers["EMAILS"] ?? ""}
//                             onReplaceEmail={handleReplaceEmail} onDeleteEmail={handleDeleteEmail}
//                             onAddEmail={handleAddEmail}
//                             emailLog={emailLogs?.["EMAILS"] ?? null}
//                           />
//                         </div>
//                       </>
//                     )}

//                     {Object.keys(replacements).length > 0 && (
//                       <div className="pt-1 space-y-1">
//                         {Object.entries(replacements).map(([role, data]) => {
//                           const step = [...flowSteps, PR_USR_STEP, EMAILS_STEP].find((s) => s.key === role);
//                           const color = step?.color ?? "#64748b";
//                           return (
//                             <motion.div key={role} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
//                               className="px-3 py-1.5 rounded-xl flex items-center gap-2"
//                               style={{ background: `${color}10`, border: `1px dashed ${color}50` }}>
//                               <span className="text-xs" style={{ color }}>
//                                 ↳ <strong>{role}</strong> → <strong>{data.name}</strong>
//                                 {data.username && data.username !== data.name && ` (${data.username})`}
//                                 {" "}from <strong>{data.date}</strong>
//                               </span>
//                             </motion.div>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <FlowLegend />
//         {!loadingPlants && !plantError && plantOptions.length > 0 && (
//           <OverviewTable plantOptions={plantOptions} typeColorMap={typeColorMap} authHeaders={authHeaders} />
//         )}
//       </div>

//       <AnimatePresence>
//         {toastMsg && (
//           <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
//             className="fixed z-50 px-5 py-3 text-sm font-semibold text-white -translate-x-1/2 shadow-2xl bottom-6 left-1/2 rounded-2xl"
//             style={{ background: toastError ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#1e293b,#334155)" }}>
//             {toastError ? "✗" : "✓"} {toastMsg}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../Config";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// ─── FLOW CONFIG ──────────────────────────────────────────────────────────────
const FLOW_STEPS = {
  PROJECTS: [
    { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
    { key: "PRJ_INCHARGE", label: "Prj. Incharge", icon: "👤", color: "#ef4444" },
    { key: "PLANNING_QS", label: "Planning & QS", icon: "👤", color: "#f59e0b" },
    { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#d946ef" },  // Changed from #ec4899 to #d946ef
    { key: "PRESIDENT_PRJ", label: "President (Prj)", icon: "👤", color: "#6366f1" },
    { key: "DIRECTOR_PRJ", label: "Director", icon: "👤", color: "#10b981" },
  ],
  RMC: [
    { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
    { key: "PRJ_INCHARGE", label: "Prj. Incharge", icon: "👤", color: "#ef4444" },
    { key: "PLANNING_QS", label: "Planning & QS", icon: "👤", color: "#f59e0b" },
    { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#d946ef" },  // Changed from #ec4899 to #d946ef
    { key: "PRESIDENT_PRJ", label: "President (Prj)", icon: "👤", color: "#6366f1" },
    { key: "DIRECTOR_PRJ", label: "Director", icon: "👤", color: "#10b981" },
  ],
  MAINTENANCE: [
    { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
    { key: "PRJ_INCHARGE", label: "Prj. Incharge", icon: "👤", color: "#ef4444" },
    { key: "PLANNING_QS", label: "Planning & QS", icon: "👤", color: "#f59e0b" },
    { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#d946ef" },  // Changed from #ec4899 to #d946ef
    { key: "PRESIDENT", label: "Senior President", icon: "👤", color: "#6366f1" },
    { key: "DIRECTOR_PRJ", label: "Director", icon: "👤", color: "#10b981" },
  ],
  PM: [
    { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
    { key: "PM", label: "PM", icon: "👤", color: "#8b5cf6" },
    { key: "PRJ_INCHARGE", label: "Prj. Incharge", icon: "👤", color: "#ef4444" },
    { key: "PLANNING_QS", label: "Planning & QS", icon: "👤", color: "#f59e0b" },
    { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#d946ef" },  // Changed from #ec4899 to #d946ef
    { key: "PRESIDENT_PRJ", label: "President (Prj)", icon: "👤", color: "#6366f1" },
    { key: "DIRECTOR_PRJ", label: "Director", icon: "👤", color: "#10b981" },
  ],
  SAFETY: [
    { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
    { key: "SAFETY_OFFICER", label: "Safety", icon: "👤", color: "#f97316" },
    { key: "PRJ_INCHARGE", label: "Prj. Incharge", icon: "👤", color: "#ef4444" },
    { key: "PLANNING_QS", label: "Planning & QS", icon: "👤", color: "#f59e0b" },
    { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#d946ef" },  // Changed from #ec4899 to #d946ef
    { key: "PRESIDENT_PRJ", label: "President (Prj)", icon: "👤", color: "#6366f1" },
    { key: "DIRECTOR_PRJ", label: "Director", icon: "👤", color: "#10b981" },
  ],
};

const INFO_FIELDS = [
  { key: "PR_USR", label: "PR User", icon: "👤", color: "#0891b2" },
];

const TYPE_PALETTE = [
  "#6366f1", "#ef4444", "#d946ef", "#f59e0b",
  "#3b82f6", "#ec4899", "#0891b2", "#84cc16",
];

const EMAIL_SLOT_COLORS = ["#0891b2", "#7c3aed", "#059669", "#d97706", "#dc2626", "#db2777"];

const CC_KEY_MAP = {
  RAISER: "RAISER_CC",
  PLANNING_QS: "PLANNING_QS_CC",
  PRJ_INCHARGE: "PRJ_INCHARGE_CC",
  PRJ_HEAD: "PRJ_HEAD_CC",
  PRESIDENT_PRJ: "PRESIDENT_PRJ_CC",
  PRESIDENT: "PRESIDENT_CC",
  DIRECTOR_PRJ: "DIRECTOR_PRJ_CC",
  PM: "PM_CC",
  SAFETY_OFFICER: "SAFETY_OFFICER_CC",
  PR_USR: "PR_USR_CC",
};

// ─── OVERVIEW TABLE COLS ──────────────────────────────────────────────────────
const TABLE_COLS = [
  { key: "PLANT_CODE", label: "Plant", color: "#1e293b" },
  { key: "RAISER", label: "Raiser", color: "#3b82f6", flows: ["PROJECTS", "RMC", "MAINTENANCE", "PM", "SAFETY"] },
  { key: "PM", label: "PM", color: "#8b5cf6", flows: ["PM"] },
  { key: "SAFETY_OFFICER", label: "Safety Officer", color: "#f97316", flows: ["SAFETY"] },
  { key: "PRJ_INCHARGE", label: "Prj. Incharge", color: "#ef4444", flows: ["PROJECTS", "RMC", "MAINTENANCE", "PM", "SAFETY"] },
  { key: "PLANNING_QS", label: "Planning & QS", color: "#f59e0b", flows: ["PROJECTS", "RMC", "MAINTENANCE", "PM", "SAFETY"] },
  { key: "PRJ_HEAD", label: "Project Head", color: "#d946ef", flows: ["PROJECTS", "RMC", "MAINTENANCE", "PM", "SAFETY"] },
  { key: "PRESIDENT_PRJ", label: "President (Prj)", color: "#6366f1", flows: ["PROJECTS", "RMC", "PM", "SAFETY"] },
  { key: "PRESIDENT", label: "Senior President", color: "#6366f1", flows: ["MAINTENANCE"] },
  { key: "DIRECTOR_PRJ", label: "Director", color: "#10b981", flows: ["PROJECTS", "RMC", "MAINTENANCE", "PM", "SAFETY"] },
  { key: "PR_USR", label: "PR User", color: "#0891b2", flows: ["PROJECTS", "RMC", "MAINTENANCE", "PM", "SAFETY"] },
  { key: "EMAILS", label: "Emails", color: "#84cc16", flows: ["PROJECTS", "RMC", "MAINTENANCE", "PM", "SAFETY"] },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getFlowType(plantType, selectedDropdown) {
  if (selectedDropdown === "SAFETY") return "SAFETY";
  if (selectedDropdown === "PM") return "PM";
  if (!plantType) return "PROJECTS";
  const t = plantType.toUpperCase();
  if (t.includes("MAINTENANCE") || t.includes("MAINT")) return "MAINTENANCE";
  if (t.includes("RMC")) return "RMC";
  return "PROJECTS";
}

function chunkArray(arr, size) {
  const rows = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

function parseEmails(raw) {
  if (!raw || raw === "NULL") return [];
  return raw.split(",").map(e => e.trim()).filter(Boolean);
}

function parseRaisers(rawValue) {
  if (!rawValue || rawValue === "NULL") return [];
  return String(rawValue).split(",").map(s => s.trim()).filter(Boolean);
}

function buildRaiserSlots(rawValue) {
  const names = parseRaisers(rawValue);
  if (names.length === 0) return [null];
  return names.map(n => ({ name: n }));
}

// ─── FLOW DIAGRAM ─────────────────────────────────────────────────────────────
function FlowDiagram({ steps, flowType }) {
  const arrowColors = {
    PROJECTS: "#3b82f6", RMC: "#d946ef", MAINTENANCE: "#f59e0b", PM: "#8b5cf6",
  };
  const arrowColor = arrowColors[flowType] ?? "#64748b";
  return (
    <div className="flex flex-wrap items-center gap-1">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-1">
          <div className="px-2 py-1 text-xs font-bold text-white rounded-lg" style={{ background: step.color }}>
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M0 6h12M8 1l7 5-7 5" stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      ))}
      <div className="flex items-center gap-1 pl-2 ml-2 border-l-2 border-dashed border-slate-200">
        {INFO_FIELDS.map((f, i) => (
          <div key={f.key} className="flex items-center gap-1">
            <div className="px-2 py-1 text-xs font-semibold border rounded-lg"
              style={{ color: f.color, borderColor: `${f.color}40`, background: `${f.color}10` }}>
              {f.label}
            </div>
            {i < INFO_FIELDS.length - 1 && <span className="text-xs text-black-300">·</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PREVIOUS USER BADGE ──────────────────────────────────────────────────────
function PreviousUserBadge({ prevLog, color }) {
  const formattedDate = prevLog?.APPLICABLE_DATE
    ? new Date(prevLog.APPLICABLE_DATE).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : prevLog?.created_at
      ? new Date(prevLog.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : null;

  if (!prevLog) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl"
        style={{ background: "#f8fafc", border: "1px dashed #e2e8f0" }}>
        <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-lg" style={{ background: "#f1f5f9" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4l3 3" stroke="#494b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.05 11a9 9 0 1 0 .5-4.5" stroke="#494b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 3v5h5" stroke="#494b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="font-bold tracking-wide uppercase" style={{ fontSize: "9px", color: "#404244" }}>Previous Holder</p>
          <p className="text-xs italic text-black-400">No previous holder on record</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="mb-3 overflow-hidden rounded-xl" style={{ border: `1px solid ${color}25` }}>
      <div className="flex items-center gap-1.5 px-3 py-1.5"
        style={{ background: `${color}12`, borderBottom: `1px solid ${color}20` }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v4l3 3" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.05 11a9 9 0 1 0 .5-4.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 3v5h5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-black tracking-widest uppercase" style={{ fontSize: "9px", color }}>Previous Holder</span>
      </div>
      <div className="flex items-center gap-3 px-3 py-2" style={{ background: `${color}06` }}>
        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-xs font-black text-white rounded-lg"
          style={{ background: `linear-gradient(135deg,${color}80,${color}40)` }}>
          {(prevLog.PREVIOUS_USER || "?").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold truncate text-black-800">{prevLog.PREVIOUS_USER || "—"}</span>
            {prevLog.EMP_ID && (
              <span className="font-mono px-1.5 py-0.5 rounded-md text-white flex-shrink-0"
                style={{ fontSize: "9px", background: `${color}70` }}>{prevLog.EMP_ID}</span>
            )}
          </div>
          {prevLog.EMP_NAME && (
            <p className="flex items-center gap-1 mt-0.5" style={{ fontSize: "9px", color: `${color}70` }}>
              Changed by {prevLog.EMP_NAME}
            </p>
          )}
          {formattedDate && (
            <p className="flex items-center gap-1 mt-0.5" style={{ fontSize: "9px", color: `${color}90` }}>
              Replaced on {formattedDate}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: "8px", color: `${color}70`, fontWeight: 700 }}>current</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── PREVIOUS EMAIL BADGE ─────────────────────────────────────────────────────
function PreviousEmailBadge({ prevLog, color }) {
  const formattedDate = prevLog?.APPLICABLE_DATE
    ? new Date(prevLog.APPLICABLE_DATE).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : prevLog?.created_at
      ? new Date(prevLog.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : null;

  if (!prevLog) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl"
        style={{ background: "#f8fafc", border: "1px dashed #e2e8f0" }}>
        <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-lg"
          style={{ background: "#f1f5f9" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4l3 3" stroke="#494b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.05 11a9 9 0 1 0 .5-4.5" stroke="#494b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 3v5h5" stroke="#494b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="font-bold tracking-wide uppercase" style={{ fontSize: "9px", color: "#404244" }}>Previous CC Email</p>
          <p className="text-xs italic text-black-400">No previous CC email on record</p>
        </div>
      </motion.div>
    );
  }

  const prevEmails = prevLog.PREVIOUS_EMAIL
    ? prevLog.PREVIOUS_EMAIL.split(",").map(e => e.trim()).filter(Boolean)
    : [];
  const currEmails = prevLog.CURRENT_EMAIL
    ? prevLog.CURRENT_EMAIL.split(",").map(e => e.trim()).filter(Boolean)
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="mb-2 overflow-hidden rounded-xl" style={{ border: `1px solid ${color}25` }}>
      <div className="flex items-center gap-1.5 px-3 py-1.5"
        style={{ background: `${color}12`, borderBottom: `1px solid ${color}20` }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v4l3 3" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.05 11a9 9 0 1 0 .5-4.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 3v5h5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-black tracking-widest uppercase" style={{ fontSize: "9px", color }}>
          Previous CC Email History
        </span>
      </div>
      <div className="px-3 py-2" style={{ background: `${color}06` }}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="mb-1 font-black uppercase" style={{ fontSize: "8px", color: `${color}80` }}>Before</p>
            {prevEmails.length === 0 ? (
              <p className="text-xs italic text-black-400">None</p>
            ) : prevEmails.map((em, i) => (
              <div key={i} className="flex items-center gap-1 mb-0.5">
                <span className="flex items-center justify-center flex-shrink-0 w-4 h-4 text-white rounded-full"
                  style={{ fontSize: "8px", background: `${color}60` }}>{i + 1}</span>
                <p className="text-xs font-semibold truncate text-black-600">{em}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center flex-shrink-0 pt-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="mb-1 font-black uppercase" style={{ fontSize: "8px", color }}>After</p>
            {currEmails.length === 0 ? (
              <p className="text-xs italic text-black-400">None</p>
            ) : currEmails.map((em, i) => (
              <div key={i} className="flex items-center gap-1 mb-0.5">
                <span className="flex items-center justify-center flex-shrink-0 w-4 h-4 text-white rounded-full"
                  style={{ fontSize: "8px", background: color }}>{i + 1}</span>
                <p className="text-xs font-bold truncate text-black-800">{em}</p>
              </div>
            ))}
          </div>
        </div>
        {formattedDate && (
          <p className="flex items-center gap-1 mt-1.5" style={{ fontSize: "9px", color: `${color}90` }}>
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
              <path d="M6 4v2l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Changed on {formattedDate}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── SHARED REPLACE FORM ──────────────────────────────────────────────────────
function ReplaceForm({ step, onReplace, isEmail = false, currentValue = "", ccEmailMode = false }) {
  const [newEmpId, setNewEmpId] = useState("");
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [applicableDate, setDate] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const debounceRef = useRef(null);

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem("userInfo"))?.token ?? null; }
    catch { return null; }
  };

  const handleEmpIdChange = (e) => {
    const val = e.target.value;
    setNewEmpId(val); setFetchError(null); setSaveState(null);
    setNewName(""); setNewUsername("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 3) return;
    debounceRef.current = setTimeout(async () => {
      setFetching(true);
      try {
        const token = getToken();
        const res = await fetch(
          `${API_BASE_URL}get-emp-by-id?EMP_ID=${encodeURIComponent(val.trim())}`,
          { headers: { "Content-Type": "application/json", Accept: "application/json", ...(token && { Authorization: `Bearer ${token}` }) } }
        );
        const json = await res.json();
        if (!res.ok && res.status === 404) throw new Error("Not found");
        const emp = json.data ?? json;
        const name = (emp.EMP_NAME ?? "").trim();
        let username = (emp.user_name ?? "").trim();
        const emailSources = [emp.OFC_MAIL, emp.EMP_MAIL].filter(Boolean);
        if (!username) {
          for (const mail of emailSources) {
            const at = mail.indexOf("@");
            if (at !== -1) { username = mail.substring(0, at); break; }
            username = mail; break;
          }
        }
        if (!name && !username) throw new Error("Empty record");
        if (isEmail && emailSources.length > 0) setNewUsername(emailSources[0]);
        else setNewUsername(username);
        setNewName(name); setFetchError(null);
      } catch {
        setFetchError("No employee found.");
        setNewName(""); setNewUsername("");
      } finally { setFetching(false); }
    }, 600);
  };

  const handleSave = async () => {
    if (isEmail) {
      if (!newUsername.trim() || !applicableDate) return;
    } else {
      if (!newEmpId.trim() || !newName.trim() || !newUsername.trim() || !applicableDate) return;
    }

    let normalizedDate = applicableDate;
    const parts = applicableDate.split("-");
    if (parts.length === 3 && parts[0].length !== 4) normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    setSaving(true); setSaveState(null); setSaveMsg("");
    try {
      await onReplace({ name: newName, emp_id: newEmpId, username: newUsername, date: normalizedDate });
      setSaveState("success"); setSaveMsg("Saved!");
    } catch (err) {
      setSaveState("error"); setSaveMsg(err.message ?? "Failed.");
    } finally { setSaving(false); }
  };

  const today = new Date().toLocaleDateString("en-CA");
  let comparableDate = applicableDate;
  const _parts = applicableDate ? applicableDate.split("-") : [];
  if (_parts.length === 3 && _parts[0].length !== 4) comparableDate = `${_parts[2]}-${_parts[1]}-${_parts[0]}`;
  const isFuture = comparableDate > today;

  const canSave = newEmpId.trim() && newName.trim() && newUsername.trim() && applicableDate && !fetching && !saving;

  const inp = "w-full px-1.5 py-1 text-xs font-bold rounded-md border-2 focus:outline-none transition-colors placeholder:text-black-400 placeholder:font-normal bg-white border-slate-300 focus:border-blue-500 text-black-800";
  const inpOk = "w-full px-1.5 py-1 text-xs font-bold rounded-md border-2 focus:outline-none transition-colors bg-emerald-50 border-emerald-400 text-black-800";
  const lbl = "block font-black text-black-600 mb-0.5";

  const updateBtn = (
    <motion.button
      whileHover={{ scale: canSave ? 1.02 : 1 }} whileTap={{ scale: canSave ? 0.97 : 1 }}
      onClick={handleSave} disabled={!canSave}
      className="flex items-center justify-center gap-1 px-3 py-1 text-xs font-bold text-white transition-all rounded-md disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      style={{
        background: saveState === "success"
          ? "linear-gradient(135deg,#d946ef,#059669)"
          : saving ? `${step.color}99`
            : `linear-gradient(135deg,${step.color},${step.color}cc)`
      }}>
      {saving && (
        <svg className="animate-spin" width="9" height="9" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}
      {saveState === "success" ? "✓ Saved" : saving ? "…" : "Update"}
    </motion.button>
  );

  const statusRow = (applicableDate || fetchError || saveState === "error") && (
    <div className="flex items-center gap-3 pt-0.5">
      {applicableDate && (
        <p style={{ fontSize: "9px", color: isFuture ? "#f59e0b" : "#d946ef" }} className="font-semibold">
          {isFuture ? `⏰ Scheduled ${applicableDate}` : "⚡ Applies immediately"}
        </p>
      )}
      {fetchError && <p style={{ fontSize: "9px" }} className="text-red-400">{fetchError}</p>}
      {saveState === "error" && <p style={{ fontSize: "9px" }} className="font-semibold text-red-500">✗ {saveMsg}</p>}
    </div>
  );

  // ── CC EMAIL MODE: keep original 2-row layout ──────────────────────────────
  if (ccEmailMode) {
    return (
      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <div style={{ width: "120px", flexShrink: 0 }}>
            <label style={{ fontSize: "9px" }} className={lbl}>
              EMP ID
              {!newEmpId && <span className="ml-1 text-red-500">*</span>}
              {fetching && <svg className="inline ml-1 animate-spin" width="8" height="8" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" /><path d="M12 2a10 10 0 0 1 10 10" stroke={step.color} strokeWidth="4" strokeLinecap="round" /></svg>}
              {!fetching && newName && <span className="ml-1 text-emerald-500">✓</span>}
              {fetchError && <span className="ml-1 text-red-400">✗</span>}
            </label>
            <input type="text" value={newEmpId} onChange={handleEmpIdChange}
              placeholder="EMP___" className={inp}
              style={{ borderColor: fetchError ? "#ef4444" : undefined }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "9px" }} className={lbl}>
              {isEmail ? "Email" : "Username"}
              {isEmail && !newUsername && <span className="ml-1 text-red-500">*</span>}
              {newUsername && <span className="ml-1 text-emerald-400">✦</span>}
            </label>
            <div className="relative group">
              <input type={isEmail ? "email" : "text"} value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={isEmail ? "email@domain.com" : "Auto-filled"}
                className={newUsername ? inpOk : inp} />
              {isEmail && newUsername && (
                <div className="absolute z-50 left-0 bottom-full mb-1.5 hidden group-hover:block pointer-events-none px-2.5 py-1.5 rounded-lg shadow-lg"
                  style={{ background: "#1e293b", color: "#93c5fd", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {newUsername}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <div style={{ flex: 1.5 }}>
            <label style={{ fontSize: "9px" }} className={lbl}>
              Full Name
              {!newName && <span className="ml-1 text-red-500">*</span>}
              {newName && <span className="ml-1 text-emerald-400">✦</span>}
            </label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="Auto-filled from EMP ID" className={newName ? inpOk : inp} />
          </div>
          <div style={{ width: "120px", flexShrink: 0 }}>
            <label style={{ fontSize: "9px" }} className={lbl}>
              From Date
              {!applicableDate && <span className="ml-1 text-red-500">*</span>}
              {applicableDate && <span className="ml-1 text-emerald-400">✦</span>}
            </label>
            <input type="date" value={applicableDate}
              onChange={(e) => { setDate(e.target.value); setSaveState(null); }}
              className={applicableDate ? inpOk : inp} />
          </div>
          <div style={{ width: "80px", flexShrink: 0 }}>
            <div style={{ height: "15px" }} />
            {updateBtn}
          </div>
        </div>
        {statusRow}
      </div>
    );
  }

  // ── NORMAL MODE: all 4 fields + button in ONE ROW ─────────────────────────
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5 items-end">
        {/* EMP ID */}
        <div style={{ width: "95px", flexShrink: 0 }}>
          <label style={{ fontSize: "9px" }} className={lbl}>
            EMP ID
            {!newEmpId && <span className="text-red-500 ml-0.5">*</span>}
            {fetching && (
              <svg className="inline ml-1 animate-spin" width="8" height="8" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke={step.color} strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            {!fetching && newName && <span className="text-emerald-500 ml-0.5">✓</span>}
            {fetchError && <span className="text-red-400 ml-0.5">✗</span>}
          </label>
          <input type="text" value={newEmpId} onChange={handleEmpIdChange}
            placeholder="EMP___" className={inp}
            style={{ borderColor: fetchError ? "#ef4444" : undefined }} />
        </div>

        {/* USERNAME */}
        <div style={{ flex: 1.2 }}>
          <label style={{ fontSize: "9px" }} className={lbl}>
            Username
            {!newUsername && <span className="text-red-500 ml-0.5">*</span>}
            {newUsername && <span className="text-emerald-400 ml-0.5">✦</span>}
          </label>
          <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Auto-filled" className={newUsername ? inpOk : inp} />
        </div>

        {/* FULL NAME */}
        <div style={{ flex: 1.8 }}>
          <label style={{ fontSize: "9px" }} className={lbl}>
            Full Name
            {!newName && <span className="text-red-500 ml-0.5">*</span>}
            {newName && <span className="text-emerald-400 ml-0.5">✦</span>}
          </label>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Auto-filled from EMP ID" className={newName ? inpOk : inp} />
        </div>

        {/* FROM DATE */}
        <div style={{ width: "115px", flexShrink: 0 }}>
          <label style={{ fontSize: "9px" }} className={lbl}>
            From Date
            {!applicableDate && <span className="text-red-500 ml-0.5">*</span>}
            {applicableDate && <span className="text-emerald-400 ml-0.5">✦</span>}
          </label>
          <input type="date" value={applicableDate}
            onChange={(e) => { setDate(e.target.value); setSaveState(null); }}
            className={applicableDate ? inpOk : inp} />
        </div>

        {/* UPDATE BUTTON */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ height: "15px" }} />
          {updateBtn}
        </div>
      </div>
      {statusRow}
    </div>
  );
}

// ─── DELETE CONFIRM ────────────────────────────────────────────────────────────
function DeleteConfirm({ step, currentUser, onDelete, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setDeleting(true); setError(null);
    try { await onDelete(); setDone(true); }
    catch (err) { setError(err.message ?? "Delete failed."); }
    finally { setDeleting(false); }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl"
        style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#15803d" }}>
        ✓ Removed successfully
      </div>
    );
  }

  return (
    <div className="p-3 border rounded-xl" style={{ borderColor: "#ef444440", background: "#fef2f2" }}>
      <p className="mb-1 text-xs font-bold text-red-700">Remove this position?</p>
      {currentUser && (
        <p className="mb-3 text-xs text-black-600">
          <span className="font-semibold" style={{ color: step.color }}>{currentUser}</span> will be removed from <strong>{step.label}</strong>.
        </p>
      )}
      {error && <p className="mb-2 text-xs text-red-600">✗ {error}</p>}
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-black-600 bg-white hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-1"
          style={{ background: deleting ? "#ef444499" : "linear-gradient(135deg,#ef4444,#dc2626)" }}>
          {deleting ? (
            <svg className="animate-spin" width="10" height="10" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              <path d="M6 1a5 5 0 0 1 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : "✗ Confirm Remove"}
        </button>
      </div>
    </div>
  );
}

// ─── EMAIL EDIT PANEL ─────────────────────────────────────────────────────────
function EmailEditPanel({ step, emailSlots, onReplace, onDelete, onAddNew, onClose }) {
  const [activeSlot, setActiveSlot] = useState(null);
  const [addForms, setAddForms] = useState([]);

  const addNewForm = () => setAddForms(prev => [...prev, { id: Date.now() }]);
  const removeForm = (id) => setAddForms(prev => prev.filter(f => f.id !== id));

  return (
    <div className="p-3 mt-1 border rounded-2xl" style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black tracking-widest uppercase" style={{ color: step.color }}>
          Manage CC Emails
        </span>
        <button onClick={onClose}
          className="px-2 py-1 text-xs transition-colors border rounded-lg text-black-600 border-slate-200 hover:bg-slate-50">
          ✕ Close
        </button>
      </div>

      <div className="space-y-2">
        {emailSlots.length === 0 && (
          <div className="p-3 text-xs text-center border rounded-xl bg-slate-50 border-slate-200 text-black-400">
            No CC emails configured. Add one below.
          </div>
        )}
        {emailSlots.map((email, idx) => {
          const isActive = activeSlot?.idx === idx;
          const slotColor = EMAIL_SLOT_COLORS[idx % EMAIL_SLOT_COLORS.length];
          return (
            <div key={`email-slot-${idx}`} className="overflow-hidden border rounded-xl"
              style={{ borderColor: `${slotColor}25`, background: "white" }}>
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 font-black text-white rounded-full"
                  style={{ background: slotColor, fontSize: "9px" }}>{idx + 1}</div>
                <div className="flex items-center justify-center flex-shrink-0 text-sm rounded-lg w-7 h-7"
                  style={{ background: `${slotColor}18` }}>📧</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: slotColor }}>{email}</p>
                  <p style={{ fontSize: "9px", color: "#94a3b8" }}>Email slot {idx + 1} of {emailSlots.length}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setActiveSlot(isActive && activeSlot?.mode === "change" ? null : { idx, mode: "change" })}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white transition-all rounded-lg"
                    style={{ background: isActive && activeSlot?.mode === "change" ? "#d97706" : "#f59e0b" }}>
                    <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                      <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15H2v-3L11.5 2.5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Change
                  </button>
                  <button
                    onClick={() => setActiveSlot(isActive && activeSlot?.mode === "delete" ? null : { idx, mode: "delete" })}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white transition-all rounded-lg"
                    style={{ background: isActive && activeSlot?.mode === "delete" ? "#dc2626" : "#ef444499" }}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M2 3h8M5 1h2M4 3v7M8 3v7M2 3l1 8h6l1-8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Del
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {isActive && activeSlot?.mode === "change" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                    <div className="px-3 pt-1 pb-3 border-t" style={{ borderColor: "#f59e0b30" }}>
                      <p className="mb-2 text-xs font-bold" style={{ color: "#f59e0b" }}>Change Email</p>
                      <ReplaceForm step={{ ...step, color: "#f59e0b" }} currentValue={email} isEmail={true}
                        ccEmailMode={true}
                        onReplace={(data) => { onReplace(idx, data); setActiveSlot(null); }} />
                    </div>
                  </motion.div>
                )}
                {isActive && activeSlot?.mode === "delete" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                    <div className="px-3 pt-1 pb-3 border-t" style={{ borderColor: "#ef444430" }}>
                      <DeleteConfirm step={{ ...step, color: slotColor, label: `Email ${idx + 1}` }} currentUser={email}
                        onDelete={() => { onDelete(idx); setActiveSlot(null); }}
                        onCancel={() => setActiveSlot(null)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {addForms.map((form, formIdx) => (
          <motion.div key={form.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="p-3 mt-2 border rounded-xl" style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: step.color }}>
                  New Email #{emailSlots.length + formIdx + 1}
                </span>
                <button onClick={() => removeForm(form.id)} className="text-xs transition-colors text-black-600 hover:text-red-500">
                  ✕ Remove
                </button>
              </div>
              <ReplaceForm key={form.id} step={step} currentValue="" isEmail={true}
                ccEmailMode={true}
                onReplace={async (data) => { await onAddNew(data); removeForm(form.id); }} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button onClick={addNewForm}
        className="flex items-center justify-center w-full gap-2 py-2 mt-3 text-xs font-bold transition-all border-2 border-dashed rounded-xl hover:shadow-sm"
        style={{ borderColor: `${step.color}50`, color: step.color, background: `${step.color}05` }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v10M1 6h10" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
        </svg>
        Add New Email
      </button>
    </div>
  );
}

// ─── POSITION CC EMAILS WIDGET ────────────────────────────────────────────────
function PositionCCEmails({ positionKey, ccValue, step, onAddEmail, onReplaceEmail, onDeleteEmail, emailLog }) {
  const [open, setOpen] = useState(false);

  const resolvedValue = (ccValue && ccValue !== "NULL" && ccValue.trim())
    ? ccValue
    : (emailLog?.CURRENT_EMAIL ?? "");
  const emails = parseEmails(resolvedValue);
  const ccKey = `${positionKey}_CC`;

  return (
    <div className="pt-2 mt-2 border-t" style={{ borderColor: `${step.color}20` }}>
      <button onClick={() => setOpen(!open)} className="w-full group">
        <div className="flex items-center gap-2 px-3 py-2 transition-all duration-300 border-2 cursor-pointer rounded-xl hover:shadow-md"
          style={{
            borderColor: open ? step.color : `${step.color}30`,
            background: open ? `linear-gradient(135deg,${step.color}15,${step.color}08)` : `${step.color}05`,
            boxShadow: open ? `0 2px 12px ${step.color}20` : "none",
            borderStyle: "dashed",
          }}>
          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm transition-transform rounded-lg group-hover:scale-110"
            style={{ background: `${step.color}20` }}>📧</div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <p className="font-bold uppercase" style={{ color: step.color, fontSize: "10px", letterSpacing: "0.08em" }}>
                CC Emails
              </p>
              {emailLog && (
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: step.color, opacity: 0.5 }} title="Has CC email history" />
              )}
            </div>
            <p className="text-xs font-semibold leading-tight truncate text-black-800">
              {emails.length === 0
                ? <span className="italic text-black-400">No emails assigned</span>
                : emails.length === 1 ? emails[0] : `${emails.length} emails configured`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {emails.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-white font-black"
                style={{ fontSize: "8px", background: step.color }}>{emails.length}</span>
            )}
            <div className="flex items-center justify-center w-6 h-6 transition-transform duration-300 rounded-full"
              style={{ background: `${step.color}15`, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className="mt-2">
              <PreviousEmailBadge prevLog={emailLog ?? null} color={step.color} />
            </div>
            <EmailEditPanel
              step={step}
              emailSlots={emails}
              onReplace={(idx, data) => onReplaceEmail(ccKey, idx, data)}
              onDelete={(idx) => onDeleteEmail(ccKey, idx)}
              onAddNew={(data) => onAddEmail(ccKey, data)}
              onClose={() => setOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── APPROVAL USER CARD ───────────────────────────────────────────────────────
function UserCard({ step, stepNumber, user, onReplace, onAdd, onDelete, isInfoOnly, prevLog, slotLabel,
  indentUsers, onAddCCEmail, onReplaceCCEmail, onDeleteCCEmail, emailLogs, indentType }) {
  const [expanded, setExpanded] = useState(false);
  const [actionMode, setActionMode] = useState(null);
  const displayLabel = slotLabel || step.label;

  useEffect(() => {
    if (!expanded) setActionMode(null);
  }, [expanded]);

  useEffect(() => {
    setExpanded(false);
    setActionMode(null);
  }, [step.key, user]);

  const handleToggle = () => { setExpanded(prev => !prev); };

  return (
    <div className="relative flex-1 min-w-0">
      {!isInfoOnly && (
        <div className="absolute z-10 flex items-center justify-center w-5 h-5 text-xs font-black text-white rounded-full -top-2 -left-1"
          style={{ background: step.color }}>{stepNumber}</div>
      )}
      <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={isInfoOnly ? "" : "ml-2"}>
        <button onClick={handleToggle} className="w-full group">
          <div className="flex items-center gap-2 px-3 py-2 transition-all duration-300 border-2 cursor-pointer rounded-xl hover:shadow-md"
            style={{
              borderColor: expanded ? step.color : (isInfoOnly ? `${step.color}30` : "#e2e8f0"),
              background: expanded ? `linear-gradient(135deg,${step.color}15,${step.color}08)` : isInfoOnly ? `${step.color}05` : "white",
              boxShadow: expanded ? `0 2px 12px ${step.color}20` : "none",
              borderStyle: isInfoOnly ? "dashed" : "solid",
            }}>
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm transition-transform rounded-lg group-hover:scale-110"
              style={{ background: `${step.color}20` }}>{step.icon}</div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <p className="font-bold uppercase truncate" style={{ color: step.color, fontSize: "10px", letterSpacing: "0.08em" }}>
                  {displayLabel}
                </p>
                {isInfoOnly && (
                  <span className="px-1.5 py-0.5 rounded-md font-bold flex-shrink-0"
                    style={{ fontSize: "9px", background: `${step.color}15`, color: step.color }}>INFO</span>
                )}
                {prevLog && (
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ background: step.color, opacity: 0.5 }} title="Has position history" />
                )}
              </div>
              <p className="text-xs font-semibold leading-tight truncate text-black-800">
                {user ? user : <span className="italic text-black-400">Not assigned</span>}
              </p>
              {!expanded && prevLog?.PREVIOUS_USER && (
                <p className="truncate leading-tight flex items-center gap-1 mt-0.5" style={{ fontSize: "9px", color: "#4a4e53" }}>
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M6 4v2l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  prev: {prevLog.PREVIOUS_USER}
                </p>
              )}
            </div>
            <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 transition-transform duration-300 rounded-full"
              style={{ background: `${step.color}15`, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
              <div className="p-3 mx-1 mt-1 border rounded-xl" style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>
                {user ? (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center flex-shrink-0 text-sm font-bold text-white w-9 h-9 rounded-xl"
                      style={{ background: `linear-gradient(135deg,${step.color},${step.color}99)` }}>
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-black tracking-wide uppercase text-emerald-600" style={{ fontSize: "9px" }}>● Current</span>
                      </div>
                      <p className="text-sm font-bold leading-tight text-black-800">{user}</p>
                      <p className="text-xs text-black-400 mt-0.5">{step.label}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 mb-3 text-xs text-center border rounded-lg bg-slate-50 border-slate-200 text-black-400">
                    No user assigned to this role for the selected plant.
                  </div>
                )}

                <PreviousUserBadge prevLog={prevLog ?? null} color={step.color} />

                {!isInfoOnly && (
                  <>
                    {actionMode === null && (
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => setActionMode("add")}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                          style={{ background: `linear-gradient(135deg,${step.color},${step.color}cc)` }}>
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          Newly Add
                        </button>

                        {/* CHANGE BUTTON - NOW ALWAYS VISIBLE */}
                        <button
                          onClick={() => setActionMode("change")}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                          style={{ background: `linear-gradient(135deg,#f59e0b,#d97706)` }}>
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                            <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15H2v-3L11.5 2.5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Change
                        </button>

                        {/* DELETE BUTTON - ONLY SHOW IF USER EXISTS */}
                        {user && (
                          <button
                            onClick={() => setActionMode("delete")}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2 3h8M5 1h2M4 3v7M8 3v7M2 3l1 8h6l1-8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}

                    {actionMode === "add" && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold" style={{ color: step.color }}>Newly Add</span>
                          <button onClick={() => setActionMode(null)} className="text-xs text-slate-400 hover:text-slate-600">← back</button>
                        </div>
                        <ReplaceForm step={step} currentValue=""
                          onReplace={(data) => { onAdd(step.key, data); setActionMode(null); }} />
                      </div>
                    )}

                    {actionMode === "change" && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold" style={{ color: "#f59e0b" }}>Change Position</span>
                          <button onClick={() => setActionMode(null)} className="text-xs text-black-400 hover:text-black-600">← back</button>
                        </div>
                        <ReplaceForm step={{ ...step, color: "#f59e0b" }} currentValue={user || ""}
                          onReplace={(data) => { onReplace(step.key, data); setActionMode(null); }} />
                      </div>
                    )}

                    {actionMode === "delete" && user && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-red-600">Delete Position</span>
                          <button onClick={() => setActionMode(null)} className="text-xs text-black-400 hover:text-black-600">← back</button>
                        </div>
                        <DeleteConfirm step={step} currentUser={user}
                          onDelete={() => { onDelete(step.key); setActionMode(null); }}
                          onCancel={() => setActionMode(null)} />
                      </div>
                    )}
                  </>
                )}

                {isInfoOnly && onReplace && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs font-medium text-black-400">Update</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    <ReplaceForm step={step} currentValue={user} onReplace={(data) => onReplace(step.key, data)} />
                  </>
                )}

                <PositionCCEmails
                  positionKey={step.key}
                  ccValue={indentUsers?.[CC_KEY_MAP[step.key]] ?? ""}
                  step={step}
                  onAddEmail={onAddCCEmail}
                  onReplaceEmail={onReplaceCCEmail}
                  onDeleteEmail={onDeleteCCEmail}
                  emailLog={emailLogs?.[CC_KEY_MAP[step.key]] ?? null}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
// ─── RAISER EDIT PANEL ────────────────────────────────────────────────────────
function RaiserEditPanel({ step, raiserSlots, onReplace, onDelete, onAddNew, positionLogs,
  onClose, indentUsers, onAddCCEmail, onReplaceCCEmail, onDeleteCCEmail, emailLogs, indentType }) {
  const [activeSlot, setActiveSlot] = useState(null);
  const [addForms, setAddForms] = useState([{ id: Date.now() }]);

  const addNewForm = () => setAddForms(prev => [...prev, { id: Date.now() }]);
  const removeForm = (id) => setAddForms(prev => prev.filter(f => f.id !== id));

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="w-full overflow-hidden">
        <div className="p-4 mt-2 border rounded-2xl" style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black tracking-widest uppercase" style={{ color: step.color }}>Manage Raisers</span>
            <button onClick={onClose} className="px-2 py-1 text-xs transition-colors border rounded-lg text-black-600 border-slate-200 hover:bg-slate-50">
              ✕ Close
            </button>
          </div>

          <div className="space-y-2">
            {raiserSlots.map((slot, idx) => {
              const isActive = activeSlot?.idx === idx;
              const prevLog = positionLogs?.[`RAISER_${idx}`] ?? null;
              return (
                <div key={`raiser-${idx}`} className="overflow-hidden border rounded-xl"
                  style={{ borderColor: `${step.color}25`, background: "white" }}>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-black text-white rounded-full"
                      style={{ background: step.color }}>{idx + 1}</div>
                    <div className="flex items-center justify-center flex-shrink-0 text-sm rounded-lg w-7 h-7"
                      style={{ background: `${step.color}18` }}>{step.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-black-800">
                        {slot?.name ?? <span className="italic text-black-400">Not assigned</span>}
                      </p>
                      {prevLog?.PREVIOUS_USER && (
                        <p style={{ fontSize: "9px" }} className="text-black-400">prev: {prevLog.PREVIOUS_USER}</p>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {slot?.name && (
                        <button
                          onClick={() => setActiveSlot(isActive && activeSlot?.mode === "change" ? null : { idx, mode: "change" })}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white transition-all rounded-lg"
                          style={{ background: isActive && activeSlot?.mode === "change" ? "#d97706" : "#f59e0b" }}>
                          <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                            <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15H2v-3L11.5 2.5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Change
                        </button>
                      )}
                      <button
                        onClick={() => setActiveSlot(isActive && activeSlot?.mode === "delete" ? null : { idx, mode: "delete" })}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white transition-all rounded-lg"
                        style={{ background: isActive && activeSlot?.mode === "delete" ? "#dc2626" : "#ef444499" }}>
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                          <path d="M2 3h8M5 1h2M4 3v7M8 3v7M2 3l1 8h6l1-8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Del
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isActive && activeSlot?.mode === "change" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                        <div className="px-3 pt-1 pb-3 border-t" style={{ borderColor: "#f59e0b30" }}>
                          <p className="mb-2 text-xs font-bold" style={{ color: "#f59e0b" }}>Change Position</p>
                          <ReplaceForm step={{ ...step, color: "#f59e0b" }} currentValue={slot?.name ?? ""}
                            onReplace={(data) => { onReplace(`RAISER_${idx}`, data); setActiveSlot(null); }} />
                        </div>
                      </motion.div>
                    )}
                    {isActive && activeSlot?.mode === "delete" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                        <div className="px-3 pt-1 pb-3 border-t" style={{ borderColor: "#ef444430" }}>
                          <DeleteConfirm step={step} currentUser={slot?.name}
                            onDelete={() => { onDelete(`RAISER_${idx}`); setActiveSlot(null); }}
                            onCancel={() => setActiveSlot(null)} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {addForms.map((form, formIdx) => (
              <motion.div key={form.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="p-3 mt-2 border rounded-xl" style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: step.color }}>
                      New Raiser #{raiserSlots.length + formIdx + 1}
                    </span>
                    <button onClick={() => removeForm(form.id)} className="text-xs transition-colors text-black-600 hover:text-red-500">
                      ✕ Remove
                    </button>
                  </div>
                  <ReplaceForm key={form.id} step={step} currentValue=""
                    onReplace={async (data) => { await onAddNew(data); removeForm(form.id); }} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button onClick={addNewForm}
            className="flex items-center justify-center w-full gap-2 py-2 mt-3 text-xs font-bold transition-all border-2 border-dashed rounded-xl hover:shadow-sm"
            style={{ borderColor: `${step.color}50`, color: step.color, background: `${step.color}05` }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add New Raiser
          </button>

          <PositionCCEmails
            positionKey="RAISER"
            ccValue={indentUsers?.[CC_KEY_MAP["RAISER"]] ?? ""}
            step={step}
            onAddEmail={onAddCCEmail}
            onReplaceEmail={onReplaceCCEmail}
            onDeleteEmail={onDeleteCCEmail}
            emailLog={emailLogs?.[CC_KEY_MAP["RAISER"]] ?? null}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── MULTI-RAISER CARD GROUP ──────────────────────────────────────────────────
function MultiRaiserCards({ step, stepNumber, raiserSlots, onReplace, onDelete, onAddNew, positionLogs,
  indentUsers, onAddCCEmail, onReplaceCCEmail, onDeleteCCEmail, emailLogs, indentType }) {
  const [raiserEditOpen, setRaiserEditOpen] = useState(false);
  const slots = raiserSlots.length > 0 ? raiserSlots : [null];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2 ml-2">
        {slots.length > 1 && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-white flex-shrink-0"
            style={{ background: step.color, fontSize: "10px", fontWeight: 800 }}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <circle cx="5" cy="5" r="2.5" stroke="white" strokeWidth="1.8" />
              <circle cx="11" cy="5" r="2.5" stroke="white" strokeWidth="1.8" />
              <path d="M1 14c0-2.2 1.8-3.5 4-3.5M8 14c0-2.2 1.8-3.5 4-3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {slots.length} Raisers
          </div>
        )}
        <div className="flex-1 h-px" style={{ background: `${step.color}25` }} />
        <button onClick={() => setRaiserEditOpen(!raiserEditOpen)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 text-xs font-bold transition-all flex-shrink-0"
          style={{
            borderColor: raiserEditOpen ? step.color : `${step.color}40`,
            background: raiserEditOpen ? `${step.color}15` : `${step.color}08`,
            color: step.color,
          }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15H2v-3L11.5 2.5z" stroke={step.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {raiserEditOpen ? "Close Edit" : "Edit Raisers"}
        </button>
      </div>

      {!raiserEditOpen && (
        <div className={slots.length === 1 ? "" : "grid gap-3"} style={slots.length > 1 ? { gridTemplateColumns: "1fr 1fr" } : {}}>
          {slots.map((slot, idx) => (
            <div key={`raiser-display-${idx}`} className="flex items-center gap-2 px-3 py-2 bg-white border-2 rounded-xl"
              style={{ borderColor: "#e2e8f0" }}>
              <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 text-xs font-black text-white rounded-full"
                style={{ background: step.color }}>{slots.length === 1 ? "1" : idx + 1}</div>
              <div className="flex items-center justify-center flex-shrink-0 text-sm rounded-lg w-7 h-7"
                style={{ background: `${step.color}20` }}>{step.icon}</div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-bold uppercase" style={{ color: step.color, fontSize: "10px", letterSpacing: "0.08em" }}>
                  {slots.length === 1 ? step.label : `Raiser ${idx + 1}`}
                </p>
                <p className="text-xs font-semibold leading-tight truncate text-black-800">
                  {slot?.name ?? <span className="italic text-black-400">Not assigned</span>}
                </p>
              </div>
            </div>
          ))}
          {slots.length > 1 && slots.length % 2 !== 0 && <div />}
        </div>
      )}

      {raiserEditOpen && (
        <RaiserEditPanel
          step={step} raiserSlots={slots} onReplace={onReplace} onDelete={onDelete}
          onAddNew={onAddNew} positionLogs={positionLogs} onClose={() => setRaiserEditOpen(false)}
          indentUsers={indentUsers} onAddCCEmail={onAddCCEmail}
          onReplaceCCEmail={onReplaceCCEmail} onDeleteCCEmail={onDeleteCCEmail}
          emailLogs={emailLogs} indentType={indentType}
        />
      )}
    </div>
  );
}

// ─── PR_USR CARD ──────────────────────────────────────────────────────────────
function PrUserCard({ step, user, onReplace, onAdd, onDelete, prevLog, indentUsers, onAddCCEmail, onReplaceCCEmail, onDeleteCCEmail, emailLogs, indentType }) {
  const [expanded, setExpanded] = useState(false);
  const [actionMode, setActionMode] = useState(null);

  useEffect(() => {
    if (!expanded) setActionMode(null);
  }, [expanded]);

  useEffect(() => {
    setExpanded(false);
    setActionMode(null);
  }, [user]);

  const handleToggle = () => { setExpanded(prev => !prev); };

  return (
    <div className="relative flex-1 min-w-0">
      <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={handleToggle} className="w-full group">
          <div className="flex items-center gap-2 px-3 py-2 transition-all duration-300 border-2 cursor-pointer rounded-xl hover:shadow-md"
            style={{
              borderColor: expanded ? step.color : `${step.color}30`,
              background: expanded ? `linear-gradient(135deg,${step.color}15,${step.color}08)` : `${step.color}05`,
              boxShadow: expanded ? `0 2px 12px ${step.color}20` : "none",
              borderStyle: "dashed",
            }}>
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm transition-transform rounded-lg group-hover:scale-110"
              style={{ background: `${step.color}20` }}>{step.icon}</div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <p className="font-bold uppercase truncate" style={{ color: step.color, fontSize: "10px", letterSpacing: "0.08em" }}>
                  {step.label}
                </p>
                <span className="px-1.5 py-0.5 rounded-md font-bold flex-shrink-0"
                  style={{ fontSize: "9px", background: `${step.color}15`, color: step.color }}>INFO</span>
                {prevLog && (
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ background: step.color, opacity: 0.5 }} />
                )}
              </div>
              <p className="text-xs font-semibold leading-tight truncate text-black-800">
                {user ? user : <span className="italic text-black-400">Not assigned</span>}
              </p>
            </div>
            <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 transition-transform duration-300 rounded-full"
              style={{ background: `${step.color}15`, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
              <div className="p-3 mx-1 mt-1 border rounded-xl" style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>
                {user ? (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center flex-shrink-0 text-sm font-bold text-white w-9 h-9 rounded-xl"
                      style={{ background: `linear-gradient(135deg,${step.color},${step.color}99)` }}>
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-black tracking-wide uppercase text-emerald-600" style={{ fontSize: "9px" }}>● Current</span>
                      <p className="text-sm font-bold leading-tight text-black-800">{user}</p>
                      <p className="text-xs text-black-400 mt-0.5">{step.label}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 mb-3 text-xs text-center border rounded-lg bg-slate-50 border-slate-200 text-black-400">
                    No PR user assigned for this plant.
                  </div>
                )}
                <PreviousUserBadge prevLog={prevLog ?? null} color={step.color} />

                {actionMode === null && (
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setActionMode("add")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                      style={{ background: `linear-gradient(135deg,${step.color},${step.color}cc)` }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Newly Add
                    </button>
                    {user && (
                      <button onClick={() => setActionMode("change")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                        style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                          <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15H2v-3L11.5 2.5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Change
                      </button>
                    )}
                    {user && (
                      <button onClick={() => setActionMode("delete")}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                        style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 3h8M5 1h2M4 3v7M8 3v7M2 3l1 8h6l1-8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
                {actionMode === "add" && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold" style={{ color: step.color }}>Newly Add</span>
                      <button onClick={() => setActionMode(null)} className="text-xs text-slate-400 hover:text-slate-600">← back</button>
                    </div>
                    <ReplaceForm step={step} currentValue=""
                      onReplace={(data) => { onReplace("PR_USR", data); setActionMode(null); }} />
                  </div>
                )}

                {actionMode === "change" && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold" style={{ color: "#f59e0b" }}>Change PR User</span>
                      <button onClick={() => setActionMode(null)} className="text-xs text-black-400 hover:text-black-600">← back</button>
                    </div>
                    <ReplaceForm step={{ ...step, color: "#f59e0b" }} currentValue={user}
                      onReplace={(data) => { onReplace("PR_USR", data); setActionMode(null); }} />
                  </div>
                )}
                {actionMode === "delete" && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-red-600">Delete PR User</span>
                      <button onClick={() => setActionMode(null)} className="text-xs text-black-400 hover:text-black-600">← back</button>
                    </div>
                    <DeleteConfirm step={step} currentUser={user}
                      onDelete={() => { onDelete("PR_USR"); setActionMode(null); }}
                      onCancel={() => setActionMode(null)} />
                  </div>
                )}

                <PositionCCEmails
                  positionKey="RAISER"
                  ccValue={indentUsers?.[CC_KEY_MAP["RAISER"]] ?? ""}
                  step={step}
                  onAddEmail={onAddCCEmail}
                  onReplaceEmail={onReplaceCCEmail}
                  onDeleteEmail={onDeleteCCEmail}
                  emailLog={emailLogs?.[CC_KEY_MAP["RAISER"]] ?? null}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── MULTI-EMAIL CARDS GROUP ──────────────────────────────────────────────────
function MultiEmailCards({ step, rawValue, onReplaceEmail, onDeleteEmail, onAddEmail, emailLog }) {
  const [emailEditOpen, setEmailEditOpen] = useState(false);
  const emails = parseEmails(rawValue);

  return (
    <div className="w-full min-w-0">
      <button onClick={() => setEmailEditOpen(!emailEditOpen)} className="w-full group">
        <div className="flex items-center gap-2 px-3 py-2 transition-all duration-300 border-2 cursor-pointer rounded-xl hover:shadow-md"
          style={{
            borderColor: emailEditOpen ? step.color : `${step.color}30`,
            background: emailEditOpen ? `linear-gradient(135deg,${step.color}15,${step.color}08)` : `${step.color}05`,
            boxShadow: emailEditOpen ? `0 2px 12px ${step.color}20` : "none",
            borderStyle: "dashed",
          }}>
          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm transition-transform rounded-lg group-hover:scale-110"
            style={{ background: `${step.color}20` }}>{step.icon}</div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <p className="font-bold uppercase truncate" style={{ color: step.color, fontSize: "10px", letterSpacing: "0.08em" }}>
                {step.label}
              </p>
              <span className="px-1.5 py-0.5 rounded-md font-bold flex-shrink-0"
                style={{ fontSize: "9px", background: `${step.color}15`, color: step.color }}>INFO</span>
              {emailLog && (
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: step.color, opacity: 0.5 }} title="Has email history" />
              )}
            </div>
            <p className="text-xs font-semibold leading-tight truncate text-black-800">
              {emails.length === 0
                ? <span className="italic text-black-400">No emails assigned</span>
                : emails.length === 1 ? emails[0] : `${emails.length} emails configured`}
            </p>
          </div>
          <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 transition-transform duration-300 rounded-full"
            style={{ background: `${step.color}15`, transform: emailEditOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </button>
      <AnimatePresence>
        {emailEditOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="mt-2">
              <PreviousEmailBadge prevLog={emailLog ?? null} color={step.color} />
            </div>
            <EmailEditPanel step={step} emailSlots={emails}
              onReplace={onReplaceEmail} onDelete={onDeleteEmail}
              onAddNew={onAddEmail} onClose={() => setEmailEditOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── OVERVIEW TABLE ───────────────────────────────────────────────────────────
function OverviewTable({ plantOptions, typeColorMap, authHeaders, selectedPlant }) {
  const [bulkData, setBulkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [searchCode, setSearchCode] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [flowFilter, setFlowFilter] = useState("ALL");
  const hasFetched = useRef(false);

  const TYPE_ORDER = ["HO", "PROJECTS", "RMC", "MAINTAIN", "COMM.PROJ.", "COMM.MAIN.", "PRECAST", "CENT.YARD"];
  const rawTypes = [...new Set(plantOptions.map((p) => p.TYPE?.trim()).filter(Boolean))];
  const uniqueTypes = [
    ...TYPE_ORDER.filter((t) => rawTypes.includes(t)),
    ...rawTypes.filter((t) => !TYPE_ORDER.includes(t)).sort(),
  ];

  const filteredPlants = plantOptions.filter(
    (p) => (filterType === "ALL" || p.TYPE === filterType) &&
      (searchCode === "" || String(p.WERKS).toLowerCase().includes(searchCode.toLowerCase()) ||
        p.NAME1?.toLowerCase().includes(searchCode.toLowerCase()))
  );

  const getTypeColor = (type) => typeColorMap[type] ?? "#64748b";

  function resolveFlow(plantTypeTab, categoryDropdown) {
    const isMaint = plantTypeTab !== "ALL" &&
      (plantTypeTab.toUpperCase().includes("MAINT"));
    const isRMC = plantTypeTab !== "ALL" &&
      (plantTypeTab.toUpperCase().includes("RMC"));

    if (categoryDropdown === "PM") return isMaint ? "PM_MAINT" : "PM";
    if (categoryDropdown === "SAFETY") return isMaint ? "SAFETY_MAINT" : "SAFETY";
    if (plantTypeTab === "ALL") return "ALL";
    if (isMaint) return "MAINTENANCE";
    if (isRMC) return "RMC";
    return "PROJECTS";
  }

  const activeFlow = resolveFlow(filterType, flowFilter);

  const ORDERED_COLS = [
    { key: "RAISER", label: "Raiser", color: "#3b82f6", flows: ["ALL", "PROJECTS", "RMC", "MAINTENANCE", "PM", "PM_MAINT", "SAFETY", "SAFETY_MAINT"] },
    { key: "PM", label: "PM", color: "#8b5cf6", flows: ["PM", "PM_MAINT"] },
    { key: "SAFETY_OFFICER", label: "Safety Officer", color: "#f97316", flows: ["SAFETY", "SAFETY_MAINT"] },
    { key: "PRJ_INCHARGE", label: "Prj. Incharge", color: "#ef4444", flows: ["ALL", "PROJECTS", "RMC", "MAINTENANCE", "PM", "PM_MAINT", "SAFETY", "SAFETY_MAINT"] },
    { key: "PLANNING_QS", label: "Planning & QS", color: "#f59e0b", flows: ["ALL", "PROJECTS", "RMC", "MAINTENANCE", "PM", "PM_MAINT", "SAFETY", "SAFETY_MAINT"] },
    { key: "PRJ_HEAD", label: "Project Head", color: "#d946ef", flows: ["ALL", "PROJECTS", "RMC", "MAINTENANCE", "PM", "PM_MAINT", "SAFETY", "SAFETY_MAINT"] },
    { key: "PRESIDENT_PRJ", label: "President (Prj)", color: "#6366f1", flows: ["ALL", "PROJECTS", "RMC", "PM", "SAFETY"] },
    { key: "PRESIDENT", label: "Senior President", color: "#6366f1", flows: ["MAINTENANCE", "PM_MAINT", "SAFETY_MAINT"] },
    { key: "DIRECTOR_PRJ", label: "Director", color: "#10b981", flows: ["ALL", "PROJECTS", "RMC", "MAINTENANCE", "PM", "PM_MAINT", "SAFETY", "SAFETY_MAINT"] },
    { key: "PR_USR", label: "PR User", color: "#0891b2", flows: ["ALL", "PROJECTS", "RMC", "MAINTENANCE", "PM", "PM_MAINT", "SAFETY", "SAFETY_MAINT"] },
    { key: "EMAILS", label: "Emails", color: "#84cc16", flows: ["ALL", "PROJECTS", "RMC", "MAINTENANCE", "PM", "PM_MAINT", "SAFETY", "SAFETY_MAINT"] },
  ];

  const DATA_COLS = ORDERED_COLS.filter(c => c.flows.includes(activeFlow));

  const fetchBulk = async () => {
    setLoading(true); setLoadError(null);
    try {
      const res = await fetch(`${API_BASE_URL}indent-plant-users-bulk`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setBulkData(json.data || {});
    } catch (err) { setLoadError("Failed to load indent users. " + err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (plantOptions.length > 0 && !hasFetched.current) { hasFetched.current = true; fetchBulk(); }
  }, [plantOptions]);

  const getRow = (werks) => bulkData ? (bulkData[String(werks)] ?? {}) : null;

  const flowBadgeStyle = {
    ALL: { border: "#e2e8f0", color: "#475569" },
    PM: { border: "#8b5cf6", color: "#6d28d9" },
    SAFETY: { border: "#f97316", color: "#c2410c" },
  };
  const activeBadge = flowBadgeStyle[flowFilter];

  return (
    <div className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200">
      <div className="relative px-6 py-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%)" }}>
        <div className="absolute w-32 h-32 rounded-full -top-6 -right-6 opacity-10"
          style={{ background: "radial-gradient(circle,#818cf8,transparent)" }} />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">Indent Users Overview</h2>
              <p className="text-xs mt-0.5" style={{ color: "#93c5fd" }}>Plant-wise indent approval users from ZMM plant data</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!bulkData) return;
              const visibleCols = [{ key: "PLANT_CODE", label: "Plant" }, ...DATA_COLS];
              const headers = visibleCols.map(c => c.label);
              const rows = filteredPlants.map((p) => {
                const row = getRow(p.WERKS) ?? {};
                return visibleCols.map(c => c.key === "PLANT_CODE" ? `${p.WERKS} - ${p.NAME1}` : (row[c.key] ?? ""));
              });
              const csv = [headers, ...rows].map(r =>
                r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")
              ).join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `indent-users-${new Date().toISOString().split("T")[0]}.csv`;
              a.click(); URL.revokeObjectURL(url);
            }}
            disabled={!bulkData || loading}
            className="flex items-center flex-shrink-0 gap-2 px-4 py-2 text-xs font-bold transition-all rounded-xl hover:shadow-lg disabled:opacity-40"
            style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.4)" }}>
            {loading ? "Loading…" : "⬇ Download"}
          </button>
        </div>
      </div>

      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 flex-wrap">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg bg-white focus:outline-none cursor-pointer"
          style={{ border: `1.5px solid ${filterType !== "ALL" ? getTypeColor(filterType) : "#e2e8f0"}`, color: filterType !== "ALL" ? getTypeColor(filterType) : "#475569", minWidth: "140px" }}>
          <option value="ALL">🏭 All Types ({plantOptions.length})</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>{t} ({plantOptions.filter(p => p.TYPE === t).length})</option>
          ))}
        </select>

        <input
          type="text"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Plant code…"
          list="plant-options"
          className="pl-3 pr-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none border border-slate-200 bg-white focus:border-blue-300"
          style={{ width: "180px", color: "#1e293b" }} />
        <datalist id="plant-options">
          {filteredPlants.map((p) => (
            <option key={p.WERKS} value={`${p.WERKS} — ${p.NAME1}`} />
          ))}
        </datalist>

        <select
          value={flowFilter}
          onChange={(e) => setFlowFilter(e.target.value)}
          className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg bg-white focus:outline-none cursor-pointer"
          style={{ border: `1.5px solid ${activeBadge.border}`, color: activeBadge.color, minWidth: "160px" }}>
          <option value="ALL">📋 Category type</option>
          <option value="PM">🔵 PM </option>
          <option value="SAFETY">🟠 Safety </option>
        </select>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 p-3 mx-4 my-3 border border-red-200 rounded-2xl bg-red-50">
          <p className="text-xs font-semibold text-red-700">{loadError}</p>
          <button onClick={() => { hasFetched.current = false; fetchBulk(); }}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl">Retry</button>
        </div>
      )}

      {loading && !bulkData && (
        <div className="px-4 py-6 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              {TABLE_COLS.map((c) => <div key={c.key} className="flex-1 h-4 rounded animate-pulse bg-slate-100" />)}
            </div>
          ))}
        </div>
      )}

      {(bulkData || (!loading && !loadError)) && (
        <div className="overflow-auto" style={{ maxHeight: "520px", border: "2px solid #cbd5e1", borderRadius: "0 0 20px 20px" }}>
          <table className="w-full text-left" style={{ minWidth: "1100px", borderCollapse: "collapse", borderSpacing: 0 }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr style={{ background: "#f8fafc" }}>
                <th className="px-3 py-2.5 text-left whitespace-nowrap"
                  style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.07em", color: "#1e293b", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderBottom: "2.5px solid #94a3b8", minWidth: "195px", width: "195px" }}>
                  <span className="uppercase">Plant</span>
                </th>
                {DATA_COLS.map((col) => (
                  <th key={col.key} className="px-3 py-2.5 text-left whitespace-nowrap"
                    style={{
                      fontSize: "10px", fontWeight: 800, letterSpacing: "0.07em",
                      color: col.color, background: "#f8fafc",
                      border: "1.5px solid #cbd5e1", borderBottom: "2.5px solid #94a3b8",
                      ...(col.key === "RAISER" && { maxWidth: "90px", width: "90px" }),
                    }}>
                    <span className="uppercase">{col.label}</span>
                    {(col.key === "PR_USR" || col.key === "EMAILS" || col.key === "PM" || col.key === "SAFETY_OFFICER") && (
                      <span className="ml-1 px-1 py-0.5 rounded text-white" style={{ fontSize: "8px", background: col.color }}>INFO</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPlants.length === 0 ? (
                <tr><td colSpan={DATA_COLS.length + 1} className="py-10 text-sm text-center text-black-400">No plants match the filter.</td></tr>
              ) : filteredPlants.map((p, idx) => {
                const row = getRow(p.WERKS);
                const typeColor = getTypeColor(p.TYPE);
                return (
                  <motion.tr key={p.WERKS} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(idx * 0.006, 0.2) }}
                    style={{ background: idx % 2 === 0 ? "white" : "#fafafa" }}
                    className="transition-colors duration-100 hover:bg-blue-50">
                    <td className="px-3 py-2" style={{ border: "1.5px solid #cbd5e1", borderLeft: `3px solid ${typeColor}` }}>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="flex-shrink-0 text-xs font-black" style={{ color: typeColor }}>{p.WERKS}</span>
                          <span style={{ fontSize: "9px", color: "#94a3b8" }}>—</span>
                          <span className="text-xs font-semibold truncate" style={{ maxWidth: "130px", color: "#0f172a" }}>{p.NAME1}</span>
                        </div>
                        <span style={{ fontSize: "9px", fontWeight: 700, color: typeColor }}>{p.TYPE}</span>
                      </div>
                    </td>
                    {DATA_COLS.map((col) => (
                      <td key={col.key} className="px-3 py-2" style={{ border: "1.5px solid #cbd5e1" }}>
                        {!row ? (
                          <div className="h-3 rounded w-14 animate-pulse bg-slate-100" />
                        ) : row[col.key] && row[col.key] !== "NULL" ? (
                          col.key === "EMAILS" ? (
                            <div className="flex flex-col gap-0.5">
                              {parseEmails(row[col.key]).map((em, ei) => (
                                <span key={ei} className="text-xs font-semibold truncate text-black-700"
                                  style={{ maxWidth: "160px", display: "block" }}>{em}</span>
                              ))}
                            </div>
                          ) : col.key === "RAISER" ? (
                            <div className="flex flex-col gap-0.5">
                              {parseRaisers(row[col.key]).map((r, ri) => (
                                <span key={ri} className="text-xs font-semibold truncate text-black-800"
                                  style={{ maxWidth: "86px", display: "block" }}>{r}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-black-800">{row[col.key]}</span>
                          )
                        ) : (
                          <span className="italic text-black-400" style={{ fontSize: "11px" }}>—</span>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-black-400">
          Showing <strong className="text-black-600">{filteredPlants.length}</strong> of{" "}
          <strong className="text-black-600">{plantOptions.length}</strong> plants
          {flowFilter !== "ALL" && (
            <span className="ml-2 px-1.5 py-0.5 rounded font-bold text-white"
              style={{ fontSize: "9px", background: flowFilter === "PM" ? "#8b5cf6" : "#f97316" }}>
              {flowFilter} flow
            </span>
          )}
        </p>
        <button onClick={() => { hasFetched.current = false; fetchBulk(); }} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:shadow-md disabled:opacity-40"
          style={{ background: "#6366f110", color: "#6366f1", border: "1px solid #6366f130" }}>
          <svg className={loading ? "animate-spin" : ""} width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0 1 15.66-3M20 15a9 9 0 0 1-15.66 3" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  );
}

// ─── FLOW LEGEND ──────────────────────────────────────────────────────────────
function FlowLegend() {
  const flowBadge = {
    PROJECTS: { label: "Projects", bg: "#3b82f615", border: "#3b82f6", text: "#3b82f6" },
    RMC: { label: "RMC", bg: "#d946ef15", border: "#d946ef", text: "#d946ef" },
    MAINTENANCE: { label: "Maintenance", bg: "#f59e0b15", border: "#f59e0b", text: "#f59e0b" },
    PM: { label: "PM", bg: "#8b5cf615", border: "#8b5cf6", text: "#8b5cf6" },
    SAFETY: { label: "Safety", bg: "#f9731615", border: "#f97316", text: "#c2410c" },
  };
  const legends = [
    { type: "PROJECTS", steps: FLOW_STEPS.PROJECTS, desc: "Projects & RMC plants" },
    { type: "MAINTENANCE", steps: FLOW_STEPS.MAINTENANCE, desc: "Maintenance plants" },
    { type: "SAFETY", steps: FLOW_STEPS.SAFETY, desc: "When Safety is selected" },
    { type: "PM", steps: FLOW_STEPS.PM, desc: "When PM is selected" },
  ];
  const LEGEND_INFO_FIELDS = [{ key: "PR_USR", label: "PR User", icon: "👤", color: "#0891b2" }];

  return (
    <div className="p-5 bg-white border shadow-sm rounded-3xl border-slate-200">
      <h3 className="mb-4 text-sm font-bold tracking-wide uppercase text-black-700">Indent Flow Reference</h3>
      <div className="flex flex-col gap-3">
        {legends.map(({ type, steps, desc }) => {
          const badge = flowBadge[type];
          return (
            <div key={type} className="flex items-start gap-4 p-3 border rounded-2xl"
              style={{ borderColor: badge.border + "40", background: badge.bg }}>
              <div className="flex-shrink-0 w-40">
                <p className="text-xs font-black tracking-wide uppercase" style={{ color: badge.text }}>{badge.label}</p>
                <p className="text-xs text-black-400 mt-0.5">{desc}</p>
              </div>
              <div className="self-stretch flex-shrink-0 w-px" style={{ background: badge.border + "40" }} />
              <div className="flex flex-wrap items-center flex-1 gap-1">
                {steps.map((step, i) => (
                  <div key={step.key} className="flex items-center gap-1">
                    <div className="px-2 py-1 text-xs font-bold text-white rounded-lg" style={{ background: step.color }}>
                      {step.label}
                    </div>
                    {i < steps.length - 1 && (
                      <svg width="14" height="10" viewBox="0 0 16 12" fill="none">
                        <path d="M0 6h12M8 1l7 5-7 5" stroke={badge.border} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-1 pl-2 ml-2 border-l-2 border-dashed border-slate-200">
                  {LEGEND_INFO_FIELDS.map((f) => (
                    <div key={f.key} className="px-2 py-1 text-xs font-semibold border rounded-lg"
                      style={{ color: f.color, borderColor: `${f.color}40`, background: `${f.color}10` }}>
                      {f.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-black-400 mt-3 flex items-center gap-1.5">
        <span className="inline-block w-6 h-px border-t-2 border-dashed border-slate-300" />
        Dashed-border fields (PR User) are informational only — not part of approval chain.
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Indents() {
  const navigate = useNavigate();

  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedDropdown, setSelectedDropdown] = useState("PROJECTS");
  const [indentType, setIndentType] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [replacements, setReplacements] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const [toastError, setToastError] = useState(false);

  const [plantOptions, setPlantOptions] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [plantError, setPlantError] = useState(null);

  const [indentUsers, setIndentUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const [positionLogs, setPositionLogs] = useState({});
  const [emailLogs, setEmailLogs] = useState({});
  const [loadingLogs, setLoadingLogs] = useState(false);

  const prevPlantRef = useRef("");

  const getToken = () => { try { return JSON.parse(localStorage.getItem("userInfo"))?.token ?? null; } catch { return null; } };
  const authHeaders = () => ({ "Content-Type": "application/json", Accept: "application/json", ...(getToken() && { Authorization: `Bearer ${getToken()}` }) });
  const showToast = (msg, isError = false) => { setToastMsg(msg); setToastError(isError); setTimeout(() => setToastMsg(null), 4000); };

  const handleIndentTypeChange = (type) => {
    setIndentType(type);
    showToast(`Indent type changed to ${type} ✓`);
  };

  const fetchPlants = async () => {
    setLoadingPlants(true); setPlantError(null);
    try {
      const res = await fetch(`${API_BASE_URL}get-plant-details-auth?status=ACTIVE`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPlantOptions(json.data || []);
    } catch { setPlantError("Failed to load plants from SAP."); }
    finally { setLoadingPlants(false); }
  };

  const fetchIndentUsers = async (plantCode) => {
    setLoadingUsers(true); setUsersError(null); setIndentUsers({});
    try {
      const res = await fetch(`${API_BASE_URL}indent-plant-users?plant=${plantCode}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setIndentUsers(json.data || {});
    } catch { setUsersError("Could not load indent users for this plant."); }
    finally { setLoadingUsers(false); }
  };

  const fetchPositionLogs = async (plantCode) => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API_BASE_URL}indent-position-logs?plant=${plantCode}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPositionLogs(json.data || {});
      setEmailLogs(json.email_logs || {});
    } catch {
      setPositionLogs({});
      setEmailLogs({});
    }
    finally { setLoadingLogs(false); }
  };

  useEffect(() => { fetchPlants(); }, []);

  useEffect(() => {
    if (!selectedPlant) {
      setIndentUsers({}); setUsersError(null);
      setPositionLogs({}); setEmailLogs({});
      return;
    }
    const plantChanged = prevPlantRef.current !== selectedPlant;
    prevPlantRef.current = selectedPlant;
    if (plantChanged) {
      setReplacements({});
      setEmailLogs({});
      fetchPositionLogs(selectedPlant.slice(0, 4));
    }
    fetchIndentUsers(selectedPlant.slice(0, 4));
  }, [selectedPlant]);

  const handleReplace = async (roleKey, data) => {
    const res = await fetch(`${API_BASE_URL}indent-position-change`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ plant: selectedPlant, position_key: roleKey, new_username: data.username, new_name: data.name, new_emp_id: data.emp_id, applicable_date: data.date, flow_type: selectedDropdown }),
    });
    const json = await res.json();
    if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
    setReplacements((prev) => ({ ...prev, [roleKey]: data }));
    showToast(json.applied_now ? `${roleKey} → ${data.name} applied ✓` : `${roleKey} → ${data.name} scheduled for ${data.date} ✓`);
    if (json.applied_now) { fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4)); }
  };

  const handleDelete = async (roleKey) => {
    const res = await fetch(`${API_BASE_URL}indent-position-change`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ plant: selectedPlant, position_key: roleKey, new_username: null, new_name: null, new_emp_id: null, applicable_date: new Date().toLocaleDateString("en-CA"), flow_type: selectedDropdown, action: "DELETE" }),
    });
    const json = await res.json();
    if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
    showToast(`${roleKey} removed ✓`);
    fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4));
  };

  const handleAddNewRaiser = async (data) => {
    const currentRaisers = parseRaisers(indentUsers["RAISER"] ?? "");
    const newRaisersStr = [...currentRaisers, data.username].join(",");
    const res = await fetch(`${API_BASE_URL}indent-position-change`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ plant: selectedPlant, position_key: "RAISER", new_username: newRaisersStr, new_name: data.name, new_emp_id: data.emp_id, applicable_date: data.date, flow_type: selectedDropdown, action: "ADD_RAISER" }),
    });
    const json = await res.json();
    if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
    showToast(`New raiser ${data.name} added ✓`);
    fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4));
  };
  const handleAddNewPosition = async (roleKey, data) => {
    const currentValue = indentUsers[roleKey] ?? "";
    const existing = currentValue && currentValue !== "NULL"
      ? currentValue.split(",").map(s => s.trim()).filter(Boolean)
      : [];
    const newValueStr = [...existing, data.username].join(",");
    const res = await fetch(`${API_BASE_URL}indent-position-change`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({
        plant: selectedPlant,
        position_key: roleKey,
        new_username: newValueStr,
        new_name: data.name,
        new_emp_id: data.emp_id,
        applicable_date: data.date,
        flow_type: selectedDropdown,
        action: "ADD_POSITION",
      }),
    });
    const json = await res.json();
    if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
    showToast(`${roleKey} → ${data.name} added ✓`);
    fetchIndentUsers(selectedPlant.slice(0, 4));
    fetchPositionLogs(selectedPlant.slice(0, 4));
  };

  const handleReplacePrUser = async (roleKey, data) => {
    const res = await fetch(`${API_BASE_URL}indent-position-change`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ plant: selectedPlant, position_key: "PR_USR", new_username: data.username, new_name: data.name, new_emp_id: data.emp_id, applicable_date: data.date, flow_type: selectedDropdown }),
    });
    const json = await res.json();
    if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
    setReplacements((prev) => ({ ...prev, PR_USR: data }));
    showToast(json.applied_now ? `PR User → ${data.name} applied ✓` : `PR User → ${data.name} scheduled ✓`);
    if (json.applied_now) { fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4)); }
  };

  const handleReplaceEmail = async (emailIndex, data) => {
    const targetColumn = indentType === "MATERIAL" ? "MATERIAL_CC"
      : indentType === "SERVICE" ? "SERVICE_CC"
        : "EMAILS";
    const currentRaw = indentUsers[targetColumn] ?? "";
    const emails = parseEmails(currentRaw);
    emails[emailIndex] = data.username;
    const res = await fetch(`${API_BASE_URL}indent-position-change`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ plant: selectedPlant, position_key: targetColumn, new_email: emails.join(","), new_name: data.name, new_emp_id: data.emp_id, applicable_date: data.date, flow_type: selectedDropdown }),
    });
    const json = await res.json();
    if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
    showToast(`Email slot ${emailIndex + 1} updated ✓`);
    if (json.applied_now) { fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4)); }
  };

  const handleDeleteEmail = async (emailIndex) => {
    const targetColumn = indentType === "MATERIAL" ? "MATERIAL_CC"
      : indentType === "SERVICE" ? "SERVICE_CC"
        : "EMAILS";
    const emails = parseEmails(indentUsers[targetColumn] ?? "");
    emails.splice(emailIndex, 1);
    const res = await fetch(`${API_BASE_URL}indent-position-change`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ plant: selectedPlant, position_key: targetColumn, new_email: emails.join(",") || null, new_name: null, new_emp_id: null, applicable_date: new Date().toLocaleDateString("en-CA"), flow_type: selectedDropdown, action: "DELETE_EMAIL" }),
    });
    const json = await res.json();
    if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
    showToast(`Email removed ✓`);
    fetchIndentUsers(selectedPlant.slice(0, 4)); fetchPositionLogs(selectedPlant.slice(0, 4));
  };

  const handleAddEmail = async (data) => {
    const targetColumn = indentType === "MATERIAL" ? "MATERIAL_CC"
      : indentType === "SERVICE" ? "SERVICE_CC"
        : "EMAILS";
    const res = await fetch(`${API_BASE_URL}indent-position-change`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({
        plant: selectedPlant,
        position_key: targetColumn,
        new_email: data.username,
        new_name: data.name,
        new_emp_id: data.emp_id,
        applicable_date: data.date,
        flow_type: selectedDropdown,
        action: "ADD_EMAIL",
      }),
    });
    const json = await res.json();
    if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
    showToast(`Email added ✓`);
    fetchIndentUsers(selectedPlant.slice(0, 4));
    fetchPositionLogs(selectedPlant.slice(0, 4));
  };

  const handleAddCCEmail = async (ccKey, data) => {
    const res = await fetch(`${API_BASE_URL}indent-position-change`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({
        plant: selectedPlant,
        position_key: ccKey,
        new_email: data.username,
        new_name: data.name,
        new_emp_id: data.emp_id,
        applicable_date: data.date,
        flow_type: selectedDropdown,
        action: "ADD_EMAIL",
      }),
    });
    const json = await res.json();
    if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
    showToast(`CC email added ✓`);
    fetchIndentUsers(selectedPlant.slice(0, 4));
    fetchPositionLogs(selectedPlant.slice(0, 4));
  };

  const handleReplaceCCEmail = async (ccKey, emailIndex, data) => {
    const emails = parseEmails(indentUsers[ccKey] ?? "");
    emails[emailIndex] = data.username;
    const res = await fetch(`${API_BASE_URL}indent-position-change`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({
        plant: selectedPlant,
        position_key: ccKey,
        new_email: emails.join(","),
        new_name: data.name,
        new_emp_id: data.emp_id,
        applicable_date: data.date,
        flow_type: selectedDropdown,
      }),
    });
    const json = await res.json();
    if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
    showToast(`CC email updated ✓`);
    fetchIndentUsers(selectedPlant.slice(0, 4));
    fetchPositionLogs(selectedPlant.slice(0, 4));
  };

  const handleDeleteCCEmail = async (ccKey, emailIndex) => {
    const emails = parseEmails(indentUsers[ccKey] ?? "");
    emails.splice(emailIndex, 1);
    const res = await fetch(`${API_BASE_URL}indent-position-change`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({
        plant: selectedPlant,
        position_key: ccKey,
        new_email: emails.join(",") || null,
        new_name: null,
        new_emp_id: null,
        applicable_date: new Date().toLocaleDateString("en-CA"),
        flow_type: selectedDropdown,
        action: "DELETE_EMAIL",
      }),
    });
    const json = await res.json();
    if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
    showToast(`CC email removed ✓`);
    fetchIndentUsers(selectedPlant.slice(0, 4));
    fetchPositionLogs(selectedPlant.slice(0, 4));
  };

  const plant = plantOptions.find((p) => p.WERKS === selectedPlant);
  const plantType = plant?.TYPE ?? "";
  const flowType = getFlowType(plantType, selectedDropdown);
  const flowSteps = FLOW_STEPS[flowType] ?? FLOW_STEPS.PROJECTS;
  const getUserVal = (key) => { const v = indentUsers[key]; return v && v !== "NULL" ? v : null; };

  const TYPE_ORDER = ["HO", "PROJECTS", "RMC", "MAINTAIN", "COMM.PROJ.", "COMM.MAIN.", "PRECAST", "CENT.YARD"];
  const rawTypes = [...new Set(plantOptions.map((p) => p.TYPE?.trim()).filter(Boolean))];
  const uniqueTypes = [...TYPE_ORDER.filter((t) => rawTypes.includes(t)), ...rawTypes.filter((t) => !TYPE_ORDER.includes(t)).sort()];
  const typeColorMap = Object.fromEntries(uniqueTypes.map((t, i) => [t, TYPE_PALETTE[i % TYPE_PALETTE.length]]));
  const getTypeColor = (type) => typeColorMap[type] ?? "#64748b";
  const filteredPlants = plantOptions.filter((p) => filterType === "ALL" || p.TYPE === filterType);

  const flowBadgeColors = {
    PROJECTS: { border: "#3b82f6", bg: "#eff6ff", text: "#1d4ed8" },
    RMC: { border: "#d946ef", bg: "#ecfdf5", text: "#065f46" },
    MAINTENANCE: { border: "#f59e0b", bg: "#fffbeb", text: "#92400e" },
    PM: { border: "#8b5cf6", bg: "#f5f3ff", text: "#6d28d9" },
    SAFETY: { border: "#f97316", bg: "#fff7ed", text: "#c2410c" },
  };
  const activeBadge = flowBadgeColors[flowType] ?? flowBadgeColors.PROJECTS;

  const tabList = [
    { key: "ALL", label: "All Plants", count: plantOptions.length },
    ...uniqueTypes.map((t) => ({ key: t, label: t, count: plantOptions.filter((p) => p.TYPE === t).length }))
  ];

  const handleSelectPlant = (werks) => setSelectedPlant(werks);
  const handleClear = () => {
    setSelectedPlant(""); setReplacements({});
    setPositionLogs({}); setEmailLogs({});
    prevPlantRef.current = "";
  };

  const PR_USR_STEP = { key: "PR_USR", label: "PR User", icon: "👤", color: "#0891b2" };
  const EMAILS_STEP = { key: "EMAILS", label: "Email CC", icon: "📧", color: "#84cc16" };

  const ccProps = {
    indentUsers,
    onAddCCEmail: handleAddCCEmail,
    onReplaceCCEmail: handleReplaceCCEmail,
    onDeleteCCEmail: handleDeleteCCEmail,
    emailLogs,
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div className="px-6 py-8 mx-auto space-y-6 max-w-7xl">

        {/* Back Button */}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02, x: -2 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/mrfauthorize")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-xl hover:shadow-md"
          style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Authorization
        </motion.button>

        {/* Plant Selection Card */}
        <div className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200">
          <div className="relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#0f172a 0%,#312e81 60%,#4f46e5 100%)" }}>
            <div className="absolute w-32 h-32 rounded-full -top-6 -right-6 opacity-10"
              style={{ background: "radial-gradient(circle,#a78bfa,transparent)" }} />
            <div className="relative flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="9" y="3" width="6" height="4" rx="1" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 12h6M9 16h4" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-white">Indent Authorization</h1>
                  <p className="text-xs mt-0.5" style={{ color: "#c4b5fd" }}>Select plant, then choose Projects or PM flow</p>
                </div>
              </div>
              <div className="flex items-center flex-shrink-0 gap-3">
                {!loadingPlants && !plantError && (
                  <div className="text-right">
                    <p className="text-2xl font-black leading-none text-white">{plantOptions.length}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "#c4b5fd" }}>active plants</p>
                  </div>
                )}
                {selectedPlant && (
                  <button onClick={handleClear} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1l10 10M11 1L1 11" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {loadingPlants && (
            <div className="flex items-center justify-center gap-3 py-12 text-sm text-black-400">
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
              </svg>
              Loading active plants from SAP…
            </div>
          )}
          {plantError && !loadingPlants && (
            <div className="flex items-center justify-between gap-4 p-4 m-4 border border-red-200 rounded-2xl bg-red-50">
              <p className="text-sm font-semibold text-red-700">{plantError}</p>
              <button onClick={fetchPlants} className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-xl">Retry</button>
            </div>
          )}

          {!loadingPlants && !plantError && (
            <>
              <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                <div className="flex gap-1.5 overflow-x-auto flex-1" style={{ flexWrap: "nowrap", scrollbarWidth: "none" }}>
                  {tabList.map((tab) => {
                    const isActive = filterType === tab.key;
                    const color = tab.key === "ALL" ? "#1e293b" : getTypeColor(tab.key);
                    return (
                      <motion.button key={tab.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => { setFilterType(tab.key); handleClear(); }}
                        className="flex items-center flex-shrink-0 gap-1 transition-all duration-200"
                        style={{
                          padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
                          border: `1.5px solid ${isActive ? color : `${color}35`}`,
                          background: isActive ? `linear-gradient(135deg, ${color}, ${color}e0)` : `${color}10`,
                          color: isActive ? "white" : color,
                          boxShadow: isActive ? `0 2px 8px ${color}35` : "none",
                        }}>
                        {tab.label}
                        <span style={{ marginLeft: "3px", padding: "1px 5px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, background: isActive ? "rgba(255,255,255,0.22)" : `${color}20`, color: isActive ? "white" : color }}>
                          {tab.count}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              <div className="px-3 pt-1 pb-3 overflow-y-auto" style={{ maxHeight: "220px" }}>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
                  {filteredPlants.length === 0 ? (
                    <p className="py-8 text-xs text-center col-span-full text-black-400">No active plants found for this type.</p>
                  ) : filteredPlants.map((p) => {
                    const isSelected = selectedPlant === p.WERKS;
                    const typeColor = getTypeColor(p.TYPE);
                    return (
                      <motion.button key={p.WERKS} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectPlant(p.WERKS)} className="text-left transition-all duration-200 border-2"
                        style={{
                          padding: "6px 10px", borderRadius: "8px",
                          borderColor: isSelected ? typeColor : `${typeColor}30`,
                          background: isSelected ? `linear-gradient(135deg, ${typeColor}18, ${typeColor}08)` : `${typeColor}07`,
                          boxShadow: isSelected ? `0 2px 10px ${typeColor}25` : "none",
                        }}>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span style={{ fontSize: "9px", fontWeight: 800, color: typeColor, maxWidth: "70px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.TYPE}</span>
                          <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "4px", background: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}30` }}>
                            {p.TYPE?.toUpperCase().includes("MAINT") ? "MNT" : p.TYPE?.toUpperCase().includes("RMC") ? "RMC" : "PRJ"}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 min-w-0">
                          <span style={{ fontSize: "12px", fontWeight: 900, flexShrink: 0, color: isSelected ? typeColor : "#1e293b" }}>{p.WERKS}</span>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: isSelected ? `${typeColor}bb` : "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.NAME1}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Approval Positions (only when plant is selected) */}
        <AnimatePresence mode="wait">
          {plant && (
            <motion.div key={selectedPlant} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200">
                <div className="p-5 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-black text-black-900">{plant.WERKS} — {plant.NAME1}</h3>
                      <p className="text-sm text-black-500 mt-0.5">{plant.TYPE} · Select approval flow below</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold tracking-wide uppercase text-black-500">Flow:</label>
                      <div className="relative">
                        <select value={selectedDropdown} onChange={(e) => setSelectedDropdown(e.target.value)}
                          className="py-2 pl-3 pr-8 text-sm font-bold transition-all appearance-none cursor-pointer rounded-xl focus:outline-none"
                          style={{ border: `2px solid ${activeBadge.border}`, color: activeBadge.text, background: activeBadge.bg, minWidth: "160px" }}>
                          <option value="PROJECTS"> Projects / RMC</option>
                          <option value="PM"> PM</option>
                          <option value="SAFETY"> Safety</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2 4l4 4 4-4" stroke={activeBadge.text} strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold tracking-wide uppercase text-black-500">Indent Type:</label>
                        <div className="relative">
                          <select
                            value={indentType}
                            onChange={(e) => handleIndentTypeChange(e.target.value)}
                            className="py-2 pl-3 pr-8 text-sm font-bold transition-all appearance-none cursor-pointer rounded-xl focus:outline-none"
                            style={{
                              border: `2px solid ${indentType === "MATERIAL" ? "#d946ef" : indentType === "SERVICE" ? "#f59e0b" : "#e2e8f0"}`,
                              color: indentType === "MATERIAL" ? "#065f46" : indentType === "SERVICE" ? "#92400e" : "#94a3b8",
                              background: indentType === "MATERIAL" ? "#ecfdf5" : indentType === "SERVICE" ? "#fffbeb" : "#f8fafc",
                              minWidth: "140px"
                            }}
                          >
                            <option value="">Select Indent Type</option>
                            <option value="MATERIAL">📦 Material</option>
                            <option value="SERVICE">🛠️ Service</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2 4l4 4 4-4" stroke={indentType === "MATERIAL" ? "#d946ef" : "#f59e0b"} strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl text-xs font-black border-2"
                        style={{ borderColor: activeBadge.border, color: activeBadge.text, background: activeBadge.bg }}>
                        {flowType === "SAFETY" ? "Safety Flow" : flowType === "PM" ? "PM Flow" : flowType === "MAINTENANCE" ? "Maintenance" : flowType === "RMC" ? "RMC Flow" : "Projects Flow"}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-2xl bg-slate-50 border-slate-100">
                    {loadingUsers ? (
                      <div className="flex items-center gap-2 text-xs text-black-400">
                        <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                        Loading flow…
                      </div>
                    ) : <FlowDiagram steps={flowSteps} flowType={flowType} />}
                  </div>
                </div>

                <div className="border-t border-slate-100">
                  <div className="px-5 py-2.5 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: activeBadge.border }} />
                    <h2 className="text-sm font-bold text-black-800">Approval Positions</h2>
                    <span className="flex items-center gap-1 ml-auto text-xs font-normal text-black-500">
                      {loadingLogs ? (
                        <>
                          <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
                          </svg>
                          Loading history…
                        </>
                      ) : (
                        <>
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                            <path d="M8 4v4l2.5 2.5" stroke="#2c2e30" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="8" cy="8" r="6.5" stroke="#2c2e30" strokeWidth="1.5" />
                          </svg>
                          Click any position to view history &amp; manage
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {loadingUsers && (
                  <div className="flex items-center justify-center gap-3 py-8 text-sm text-black-400">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    Loading users…
                  </div>
                )}

                {usersError && !loadingUsers && (
                  <div className="flex items-center justify-between gap-3 p-3 mx-4 mb-4 border rounded-2xl bg-amber-50 border-amber-200">
                    <p className="text-xs font-semibold text-amber-700">{usersError}</p>
                    <button onClick={() => fetchIndentUsers(selectedPlant.slice(0, 4))}
                      className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl">Retry</button>
                  </div>
                )}

                {!loadingUsers && (
                  <div className="px-4 pt-1 pb-4 space-y-3">
                    {flowSteps.length === 0 ? (
                      <p className="py-6 text-sm text-center text-black-400">No approval steps configured.</p>
                    ) : (
                      <>
                        {(() => {
                          const raiserStep = flowSteps.find(s => s.key === "RAISER");
                          const nonRaiserSteps = flowSteps.filter(s => s.key !== "RAISER");
                          const raiserSlots = buildRaiserSlots(getUserVal("RAISER"));
                          return (
                            <>
                              {raiserStep && (
                                <MultiRaiserCards
                                  step={raiserStep} stepNumber={1} raiserSlots={raiserSlots}
                                  onReplace={handleReplace} onDelete={handleDelete}
                                  onAddNew={handleAddNewRaiser} positionLogs={positionLogs}
                                  {...ccProps}
                                />
                              )}
                              {chunkArray(nonRaiserSteps, 2).map((pair, rowIdx) => (
                                <div key={rowIdx} className="flex items-start gap-3">
                                  {pair.map((step) => {
                                    const stepIndex = flowSteps.findIndex((s) => s.key === step.key);
                                    return (
                                      <UserCard
                                        key={step.key} step={step} stepNumber={stepIndex + 1}
                                        user={getUserVal(step.key)} onReplace={handleReplace}
                                        onAdd={handleAddNewPosition}
                                        onDelete={handleDelete} isInfoOnly={false}
                                        prevLog={positionLogs[step.key] ?? null}
                                        {...ccProps}
                                      />
                                    );
                                  })}
                                  {pair.length === 1 && <div className="flex-1" />}
                                </div>
                              ))}
                            </>
                          );
                        })()}

                        <div className="flex items-center gap-3 pt-1">
                          <div className="flex-1 h-px border-t-2 border-dashed border-slate-200" />
                          <span className="px-2 text-xs font-bold tracking-widest uppercase text-black-600">
                            Info Only — Not Approval
                          </span>
                          <div className="flex-1 h-px border-t-2 border-dashed border-slate-200" />
                        </div>
                        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
                          <PrUserCard
                            step={PR_USR_STEP} user={getUserVal("PR_USR")}
                            onReplace={handleReplacePrUser} onAdd={handleAddNewPosition}
                            onDelete={handleDelete}
                            prevLog={positionLogs["PR_USR"] ?? null}
                            {...ccProps}
                          />
                          <MultiEmailCards
                            step={EMAILS_STEP}
                            rawValue={
                              indentType === "MATERIAL" ? (indentUsers["MATERIAL_CC"] ?? "") :
                                indentType === "SERVICE" ? (indentUsers["SERVICE_CC"] ?? "") :
                                  (indentUsers["EMAILS"] ?? "")
                            }
                            onReplaceEmail={handleReplaceEmail}
                            onDeleteEmail={handleDeleteEmail}
                            onAddEmail={handleAddEmail}
                            emailLog={
                              indentType === "MATERIAL" ? (emailLogs?.["MATERIAL_CC"] ?? null) :
                                indentType === "SERVICE" ? (emailLogs?.["SERVICE_CC"] ?? null) :
                                  (emailLogs?.["EMAILS"] ?? null)
                            }
                          />
                        </div>
                      </>
                    )}

                    {Object.keys(replacements).length > 0 && (
                      <div className="pt-1 space-y-1">
                        {Object.entries(replacements).map(([role, data]) => {
                          const step = [...flowSteps, PR_USR_STEP, EMAILS_STEP].find((s) => s.key === role);
                          const color = step?.color ?? "#64748b";
                          return (
                            <motion.div key={role} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                              className="px-3 py-1.5 rounded-xl flex items-center gap-2"
                              style={{ background: `${color}10`, border: `1px dashed ${color}50` }}>
                              <span className="text-xs" style={{ color }}>
                                ↳ <strong>{role}</strong> → <strong>{data.name}</strong>
                                {data.username && data.username !== data.name && ` (${data.username})`}
                                {" "}from <strong>{data.date}</strong>
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overview Table */}
        {!loadingPlants && !plantError && plantOptions.length > 0 && (
          <OverviewTable
            plantOptions={plantOptions}
            typeColorMap={typeColorMap}
            authHeaders={authHeaders}
            selectedPlant={selectedPlant}
          />)}

        {/* Flow Legend */}
        <FlowLegend />

      </div>

      {/* Toast Messages */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            className="fixed z-50 px-5 py-3 text-sm font-semibold text-white -translate-x-1/2 shadow-2xl bottom-6 left-1/2 rounded-2xl"
            style={{ background: toastError ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#1e293b,#334155)" }}>
            {toastError ? "✗" : "✓"} {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}