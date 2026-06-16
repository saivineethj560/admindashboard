import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../Config";
import { motion, AnimatePresence } from "framer-motion";

// ─── FLOW CONFIG ──────────────────────────────────────────────────────────────
const FLOW_A_PLANTS = ["2000", "2150", "2250"];
const FLOW_B_PLANTS = ["3001", "4001"];
const FLOW_STEPS = {
  A: [
    { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
    { key: "FUNC_HEAD", label: "HOD", icon: "👤", color: "#ec4899" },
    { key: "EVC", label: "EVC", icon: "👤", color: "#10b981" },
  ],
  B: [
    { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
    { key: "GM", label: "Planning & Qs", icon: "👤", color: "#f59e0b" },
    { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#ef4444" },
    { key: "FUNC_HEAD", label: "Func. Head", icon: "👤", color: "#ec4899", optional: true },
    { key: "SR_PRESIDENT", label: "Sr. President", icon: "👤", color: "#6366f1" },
    { key: "EVC", label: "EVC", icon: "👤", color: "#10b981" },
  ],
  C: [
    { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
    { key: "GM", label: "Planning & Qs", icon: "👤", color: "#f59e0b" },
    { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#ef4444" },
    { key: "FUNC_HEAD", label: "Func. Head", icon: "👤", color: "#ec4899", optional: true },
    { key: "SR_PRESIDENT", label: "Sr. President", icon: "👤", color: "#6366f1" },
    { key: "EVC", label: "EVC", icon: "👤", color: "#10b981" },
  ],
};

function buildEffectiveSteps(flowType, approvalUsers) {
  if (!flowType) return [];
  return FLOW_STEPS[flowType].filter((step) => {
    if (!step.optional) return true;
    if (flowType === "A") return false;
    return !!approvalUsers[step.key];
  });
}

function getFlow(plantCode) {
  const code = String(plantCode).slice(0, 4);
  if (FLOW_A_PLANTS.includes(code)) return "A";
  if (FLOW_B_PLANTS.includes(code)) return "B";
  return "C";
}

// ─── RAISER PARSING HELPERS ───────────────────────────────────────────────────
function parseRaisers(rawValue) {
  if (!rawValue) return [];
  const parts = String(rawValue)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts;
}

function buildRaiserSlots(raiserApiValue) {
  if (!raiserApiValue) return [null];
  const names = parseRaisers(raiserApiValue.name);
  if (names.length === 0) return [null];
  return names.map((n) => ({ name: n, emp_id: null, email: null, phone: null }));
}

const TYPE_PALETTE = [
  "#6366f1", "#ef4444", "#10b981", "#f59e0b",
  "#3b82f6", "#ec4899", "#0891b2", "#84cc16",
];

// ─── LANDING SELECTOR ─────────────────────────────────────────────────────────
function AuthorizationLanding({ onSelect }) {
  const options = [
    {
      key: "mrf",
      label: "MRF",
      description: "Manage MRF approval users and positions per plant",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      gradient: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
      border: "#3b82f6",
      bg: "#eff6ff",
      text: "#1d4ed8",
    },
    {
      key: "indent",
      label: "Indent",
      description: "Manage indent authorization flow and approvers",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)",
      border: "#7c3aed",
      bg: "#f5f3ff",
      text: "#7c3aed",
    },
  ];

  return (
    <div className="flex items-start justify-center min-h-screen p-8 pt-16" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div className="w-full max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="inline-flex items-center justify-center mb-4 overflow-hidden w-14 h-14 rounded-2xl"
            style={{ background: "white", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            <img
              src="./my home logo.png"
              alt="Logo"
              className="object-contain w-full h-full p-1"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Workflow Authorization</h1>
          <p className="text-sm text-slate-500 mt-1.5">Select the authorization type to proceed</p>
        </motion.div>
        <div className="grid grid-cols-2 gap-5">
          {options.map((opt, i) => (
            <motion.button
              key={opt.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, boxShadow: `0 12px 32px ${opt.border}30` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(opt.key)}
              className="relative p-6 overflow-hidden text-left transition-all duration-200 border-2 rounded-3xl group"
              style={{ borderColor: `${opt.border}40`, background: opt.bg }}
            >
              <div className="absolute w-24 h-24 rounded-full -top-6 -right-6 opacity-10"
                style={{ background: `radial-gradient(circle, ${opt.border}, transparent)` }} />
              <div className="relative">
                <div className="flex items-center justify-center mb-4 text-white transition-transform duration-200 w-14 h-14 rounded-2xl group-hover:scale-110"
                  style={{ background: opt.gradient }}>
                  {opt.icon}
                </div>
                <h2 className="text-xl font-black mb-1.5" style={{ color: opt.text }}>{opt.label}</h2>
                <p className="text-xs leading-relaxed text-slate-500">{opt.description}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold transition-all duration-200 group-hover:gap-2.5" style={{ color: opt.border }}>
                  <span>Open</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FLOW DIAGRAM ─────────────────────────────────────────────────────────────
function FlowDiagram({ steps, flowType }) {
  const arrowColor = { A: "#3b82f6", B: "#ef4444", C: "#f59e0b" }[flowType] ?? "#64748b";
  return (
    <div className="flex flex-wrap items-center gap-1">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-1">
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white rounded-lg" style={{ background: step.color }}>
            {step.optional && <span style={{ fontSize: "8px", opacity: 0.7 }}>●</span>}
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M0 6h12M8 1l7 5-7 5" stroke={arrowColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── PREVIOUS USER BADGE ──────────────────────────────────────────────────────
/**
 * Shows the previous holder of a position from mrf_position_logs.
 * prevLog shape: { PREVIOUS_USER, NEW_NAME, NEW_EMP_ID, APPLICABLE_DATE, created_at }
 */
function PreviousUserBadge({ prevLog, color }) {
  const formattedDate = prevLog?.APPLICABLE_DATE
    ? new Date(prevLog.APPLICABLE_DATE).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : prevLog?.created_at
      ? new Date(prevLog.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : null;

  // ── Always render — show empty state if no log ──
  if (!prevLog) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl"
        style={{ background: "#f8fafc", border: "1px dashed #e2e8f0" }}
      >
        <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-lg"
          style={{ background: "#f1f5f9" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4l3 3" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.05 11a9 9 0 1 0 .5-4.5" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 3v5h5" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="font-bold tracking-wide uppercase" style={{ fontSize: "9px", color: "#94a3b8" }}>
            Previous Holder
          </p>
          <p className="text-xs italic text-slate-400">No previous holder on record</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 overflow-hidden rounded-xl"
      style={{ border: `1px solid ${color}25` }}
    >
      {/* Header bar */}
      <div className="flex items-center gap-1.5 px-3 py-1.5"
        style={{ background: `${color}12`, borderBottom: `1px solid ${color}20` }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v4l3 3" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.05 11a9 9 0 1 0 .5-4.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 3v5h5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-black tracking-widest uppercase" style={{ fontSize: "9px", color }}>
          Previous Holder
        </span>
      </div>

      {/* Body */}
      <div className="flex items-center gap-3 px-3 py-2" style={{ background: `${color}06` }}>
        {/* Avatar */}
        <div
          className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-xs font-black text-white rounded-lg"
          style={{ background: `linear-gradient(135deg,${color}80,${color}40)` }}
        >
          {(prevLog.PREVIOUS_USER || "?").charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold truncate text-slate-800">
              {prevLog.PREVIOUS_USER || "—"}
            </span>
            {prevLog.EMP_ID && (
              <span className="font-mono px-1.5 py-0.5 rounded-md text-white flex-shrink-0"
                style={{ fontSize: "9px", background: `${color}70` }}>
                {prevLog.EMP_ID}
              </span>
            )}
          </div>
          {prevLog.EMP_NAME && (
            <p className="flex items-center gap-1 mt-0.5" style={{ fontSize: "9px", color: `${color}70` }}>
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Changed by {prevLog.EMP_NAME}
            </p>
          )}
          {formattedDate && (
            <p className="flex items-center gap-1 mt-0.5" style={{ fontSize: "9px", color: `${color}90` }}>
              <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Replaced on {formattedDate}
            </p>
          )}
        </div>

        {/* → current arrow */}
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

// ─── REPLACE FORM ─────────────────────────────────────────────────────────────
function ReplaceForm({ step, onReplace }) {
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
    setNewEmpId(val);
    setFetchError(null);
    setSaveState(null);
    setNewName("");
    setNewUsername("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 3) return;

    debounceRef.current = setTimeout(async () => {
      setFetching(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}get-emp-by-id?EMP_ID=${encodeURIComponent(val.trim())}`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
            },
          }
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
            username = mail;
            break;
          }
        }
        if (!name && !username) throw new Error("Empty record");
        setFetchError(null);
        setNewName(name);
        setNewUsername(username);
      } catch {
        setFetchError("No employee found with this ID.");
        setNewName("");
        setNewUsername("");
      } finally {
        setFetching(false);
      }
    }, 600);
  };

  const handleSave = async () => {
    if (!newEmpId.trim() || !newName.trim() || !newUsername.trim() || !applicableDate) return;
    setSaving(true);
    setSaveState(null);
    setSaveMsg("");
    try {
      await onReplace({
        name: newName,
        emp_id: newEmpId,
        username: newUsername,
        date: applicableDate,
      });
      setSaveState("success");
      setSaveMsg("Saved & logged successfully");
    } catch (err) {
      setSaveState("error");
      setSaveMsg(err.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const isFuture = applicableDate > today;
  const canSave = newEmpId.trim() && newName.trim() && newUsername.trim() && applicableDate && !fetching && !saving;

  const inputBase = "w-full px-2.5 py-1.5 text-xs rounded-lg border-2 focus:outline-none transition-colors placeholder:text-slate-400";
  const inputNormal = `${inputBase} border-slate-200 bg-white focus:border-blue-400`;
  const inputFilled = `${inputBase} border-emerald-300 bg-emerald-50`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-widest uppercase" style={{ color: step.color }}>
        <span>Replace</span>
        <div className="flex-1 h-px" style={{ background: `${step.color}30` }} />
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-0.5">Employee ID</label>
            <div className="relative">
              <input
                type="text"
                value={newEmpId}
                onChange={handleEmpIdChange}
                placeholder="EMP___"
                className={inputNormal}
                style={{ borderColor: fetchError ? "#ef4444" : undefined }}
              />
              {fetching && (
                <div className="absolute -translate-y-1/2 right-2 top-1/2">
                  <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke={step.color} strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
              )}
              {!fetching && newName && (
                <div className="absolute text-xs font-bold -translate-y-1/2 right-2 top-1/2 text-emerald-500">✓</div>
              )}
            </div>
            {fetchError && <p className="text-xs text-red-500 mt-0.5">{fetchError}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-0.5">
              Username
              {newUsername && <span className="ml-1 text-emerald-500" style={{ fontSize: "9px" }}>✦ auto</span>}
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Auto-filled"
              className={newUsername ? inputFilled : inputNormal}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-0.5">
            Full Name
            {newName && <span className="ml-1 text-emerald-500" style={{ fontSize: "9px" }}>✦ auto</span>}
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Auto-filled from Employee ID"
            className={newName ? inputFilled : inputNormal}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-0.5">Applicable From</label>
          <input
            type="date"
            value={applicableDate}
            onChange={(e) => { setDate(e.target.value); setSaveState(null); }}
            className={inputNormal}
          />
          {applicableDate && (
            <p className="text-xs mt-0.5 font-semibold" style={{ color: isFuture ? "#f59e0b" : "#10b981" }}>
              {isFuture ? `⏰ Scheduled for ${applicableDate}` : "⚡ Applies immediately on save"}
            </p>
          )}
        </div>

        <AnimatePresence>
          {saveState === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#15803d" }}
            >
              <span>✓</span><span>{saveMsg}</span>
            </motion.div>
          )}
          {saveState === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626" }}
            >
              <span>✗</span><span>{saveMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: canSave ? 1.02 : 1 }}
          whileTap={{ scale: canSave ? 0.97 : 1 }}
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-1.5 rounded-lg text-xs font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: saveState === "success"
              ? "linear-gradient(135deg,#10b981,#059669)"
              : saving
                ? `${step.color}99`
                : `linear-gradient(135deg,${step.color},${step.color}cc)`,
          }}
        >
          {saving && (
            <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="4" strokeLinecap="round" />
            </svg>
          )}
          {saveState === "success" ? "✓ Saved" : saving ? "Saving…" : "Update Person"}
        </motion.button>
      </div>
    </div>
  );
}

// ─── SINGLE USER CARD ─────────────────────────────────────────────────────────
/**
 * Now accepts `prevLog` — the latest mrf_position_logs entry for this position/plant.
 * Shows a "Previous Holder" badge inside the expanded panel.
 */
function UserCard({ step, stepNumber, user, onReplace, slotLabel, prevLog }) {
  const [expanded, setExpanded] = useState(false);

  const displayLabel = slotLabel || step.label;

  return (
    <div className="relative w-full min-w-0">
      <div
        className="absolute z-10 flex items-center justify-center w-5 h-5 text-xs font-black text-white rounded-full -top-2 -left-1"
        style={{ background: step.color }}
      >
        {stepNumber}
      </div>

      <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-2">
        <button onClick={() => setExpanded(!expanded)} className="w-full group">
          <div
            className="flex items-center gap-2 px-3 py-2 transition-all duration-300 border-2 cursor-pointer rounded-xl hover:shadow-md"
            style={{
              borderColor: expanded ? step.color : "#e2e8f0",
              background: expanded ? `linear-gradient(135deg,${step.color}15,${step.color}08)` : "white",
              boxShadow: expanded ? `0 2px 12px ${step.color}20` : "none",
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm transition-transform rounded-lg group-hover:scale-110"
              style={{ background: `${step.color}20` }}
            >
              {step.icon}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <p className="font-bold uppercase truncate" style={{ color: step.color, fontSize: "10px", letterSpacing: "0.08em" }}>
                  {displayLabel}
                </p>
                {step.optional && (
                  <span className="px-1.5 py-0.5 rounded-md font-bold flex-shrink-0"
                    style={{ fontSize: "9px", background: `${step.color}18`, color: step.color }}>
                    DEPT
                  </span>
                )}
                {/* Show "has history" dot if prevLog exists */}
                {prevLog && (
                  <span
                    className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ background: step.color, opacity: 0.5 }}
                    title="Has position history"
                  />
                )}
              </div>
              <p className="text-xs font-semibold leading-tight truncate text-slate-800">
                {user ? user.name : <span className="italic text-slate-400">Not assigned</span>}
              </p>
              {/* Previous user teaser (collapsed state) */}
              {!expanded && prevLog && prevLog.PREVIOUS_USER && (
                <p className="truncate leading-tight flex items-center gap-1 mt-0.5" style={{ fontSize: "9px", color: "#94a3b8" }}>
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M6 4v2l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  prev: {prevLog.PREVIOUS_USER}
                </p>
              )}
            </div>
            <div
              className="flex items-center justify-center flex-shrink-0 w-6 h-6 transition-transform duration-300 rounded-full"
              style={{ background: `${step.color}15`, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke={step.color} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="p-3 mx-1 mt-1 border rounded-xl"
                style={{ borderColor: `${step.color}30`, background: `${step.color}05` }}>

                {/* ── Current User Info ── */}
                {user ? (
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="flex items-center justify-center flex-shrink-0 text-sm font-bold text-white w-9 h-9 rounded-xl"
                      style={{ background: `linear-gradient(135deg,${step.color},${step.color}99)` }}
                    >
                      {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-black tracking-wide uppercase text-emerald-600" style={{ fontSize: "9px" }}>
                          ● Current
                        </span>
                      </div>
                      <p className="text-sm font-bold leading-tight text-slate-800">{user.name}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {user.emp_id && <p className="text-xs text-slate-400">{user.emp_id}</p>}
                        {user.email && <p className="text-xs text-slate-400">{user.email}</p>}
                        {user.phone && <p className="text-xs text-slate-400">{user.phone}</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 mb-3 text-xs text-center border rounded-lg bg-slate-50 border-slate-200 text-slate-400">
                    No user currently assigned to this role for the selected plant.
                  </div>
                )}

                {/* ── Previous User Badge ── */}
                <PreviousUserBadge prevLog={prevLog} color={step.color} />

                {/* ── Divider before Replace Form ── */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs font-medium text-slate-400">Update</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <ReplaceForm step={step} onReplace={onReplace} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── MULTI-RAISER CARD GROUP ───────────────────────────────────────────────────
function MultiRaiserCards({ step, stepNumber, raiserSlots, onReplace, positionLogs }) {
  const slots = raiserSlots.length > 0 ? raiserSlots : [null];
  const isMultiple = slots.length > 1;

  if (!isMultiple) {
    return (
      <UserCard
        step={step}
        stepNumber={stepNumber}
        user={slots[0]}
        slotLabel={step.label}
        onReplace={(data) => onReplace("RAISER_0", data)}
        prevLog={positionLogs?.["RAISER_0"] ?? positionLogs?.["RAISER"] ?? null}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2 ml-2">
        <div
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-white flex-shrink-0"
          style={{ background: step.color, fontSize: "10px", fontWeight: 800 }}
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <circle cx="5" cy="5" r="2.5" stroke="white" strokeWidth="1.8" />
            <circle cx="11" cy="5" r="2.5" stroke="white" strokeWidth="1.8" />
            <path d="M1 14c0-2.2 1.8-3.5 4-3.5M8 14c0-2.2 1.8-3.5 4-3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {slots.length} Raisers
        </div>
        <div className="flex-1 h-px" style={{ background: `${step.color}25` }} />
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {slots.map((user, idx) => (
          <UserCard
            key={`raiser-${idx}`}
            step={step}
            stepNumber={`${stepNumber}.${idx + 1}`}
            user={user}
            slotLabel={`Raiser ${idx + 1}`}
            onReplace={(data) => onReplace(`RAISER_${idx}`, data)}
            prevLog={positionLogs?.[`RAISER_${idx}`] ?? null}
          />
        ))}
        {slots.length % 2 !== 0 && <div />}
      </div>
    </div>
  );
}

// ─── TABLE COLUMNS CONFIG ─────────────────────────────────────────────────────
const TABLE_COLUMNS = [
  { key: "plant", label: "Plant", icon: "🏭", color: "#1e293b" },
  { key: "RAISER", label: "Raiser", icon: "👤", color: "#3b82f6" },
  { key: "GM", label: "Planning & Qs", icon: "👤", color: "#f59e0b" },
  { key: "PRJ_HEAD", label: "Project Head", icon: "👤", color: "#ef4444" },
  { key: "FUNC_HEAD", label: "Func. Head / HOD", icon: "👤", color: "#ec4899" },
  { key: "SR_PRESIDENT", label: "Sr. President", icon: "👤", color: "#6366f1" },
  { key: "DIRECTOR", label: "Director", icon: "👤", color: "#0891b2" },
  { key: "EVC", label: "EVC", icon: "👤", color: "#10b981" },
];

const ROLE_COLS = TABLE_COLUMNS.filter(c => c.key !== "plant");
const ROLE_KEYS = ROLE_COLS.map(c => c.key);

// ─── DEPT SUB ROW ─────────────────────────────────────────────────────────────
function DeptSubRow({ dept, deptData, onRemove, typeColor, isLast }) {
  const data = deptData;
  const hasFuncHead = !!(data && data["FUNC_HEAD"]?.name);

  return (
    <motion.tr
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
      style={{
        background: "linear-gradient(90deg,#f5f0fe 0%,#faf7ff 100%)",
        borderBottom: isLast ? "2px solid #ddd6fe" : "1px solid #ede9fe",
      }}
    >
      <td className="px-3 py-2" style={{ paddingLeft: "28px" }}>
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col items-center flex-shrink-0" style={{ width: "12px" }}>
            <div style={{ width: "1px", height: "8px", background: "#c4b5fd" }} />
            <div style={{ width: "8px", height: "1px", background: "#c4b5fd" }} />
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{ background: "#8b5cf615", border: "1px solid #8b5cf630" }}>
            <span style={{ fontSize: "9px" }}>🏢</span>
            <span className="font-bold" style={{ fontSize: "10px", color: "#7c3aed", maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {dept}
            </span>
            {hasFuncHead && <span style={{ fontSize: "8px", color: "#ec4899" }}>⚙️</span>}
          </div>
          <button
            onClick={() => onRemove(dept)}
            className="flex items-center justify-center flex-shrink-0 transition-colors rounded-full hover:bg-red-100"
            style={{ width: "14px", height: "14px", background: "#ef444415", border: "1px solid #ef444430" }}
            title={`Remove ${dept}`}
          >
            <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </td>
      {ROLE_COLS.map((col) => (
        <td key={col.key} className="px-3 py-2">
          {data === null ? (
            <div className="h-3 rounded w-14 animate-pulse bg-violet-100" />
          ) : data[col.key]?.name ? (
            <div className="flex flex-col gap-0.5">
              {col.key === "RAISER"
                ? parseRaisers(data[col.key].name).map((r, i) => (
                  <span key={i} className="text-xs font-semibold leading-tight truncate text-slate-700" style={{ maxWidth: "110px" }} title={r}>
                    {i > 0 && <span className="mr-1 text-slate-300" style={{ fontSize: "9px" }}>▸</span>}
                    {r}
                  </span>
                ))
                : (
                  <>
                    <span className="text-xs font-semibold leading-tight truncate text-slate-700" style={{ maxWidth: "110px" }} title={data[col.key].name}>
                      {data[col.key].name}
                    </span>
                    {data[col.key].emp_id && (
                      <span className="font-mono" style={{ color: col.color, fontSize: "10px" }}>
                        {data[col.key].emp_id}
                      </span>
                    )}
                  </>
                )
              }
            </div>
          ) : (
            <span className="text-xs text-slate-200">—</span>
          )}
        </td>
      ))}
    </motion.tr>
  );
}

// ─── PLANT ROW ────────────────────────────────────────────────────────────────
function PlantRow({ plant, idx, departments, typeColor, getActiveRoles, flowBadge, expandedDepts, onAddAll, onCollapse, onRemoveDept, deptCache, deptLoading }) {
  const activeRoles = getActiveRoles(plant.WERKS);
  const flow = getFlow(plant.WERKS);
  const badge = flowBadge[flow];
  const deptSet = expandedDepts[plant.WERKS] ?? new Set();
  const deptList = [...deptSet];
  const allExpanded = departments.length > 0 && deptSet.size === departments.length;

  return (
    <>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: Math.min(idx * 0.008, 0.25) }}
        style={{
          borderBottom: deptList.length > 0 ? "none" : "1px solid #f1f5f9",
          background: deptList.length > 0 ? (idx % 2 === 0 ? "#faf5ff" : "#f5f0fe") : (idx % 2 === 0 ? "white" : "#fafafa"),
          transition: "background 0.2s",
        }}
        className="transition-colors duration-100 hover:bg-blue-50"
      >
        <td className="px-3 py-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-black" style={{ color: typeColor }}>{plant.WERKS}</span>
              <span style={{ fontSize: "9px", fontWeight: 800, color: typeColor }}>{plant.TYPE}</span>
              <span className="text-xs font-medium truncate text-slate-500" style={{ maxWidth: "130px" }} title={plant.NAME1}>{plant.NAME1}</span>
            </div>
            <button
              onClick={() => allExpanded ? onCollapse(plant.WERKS) : onAddAll(plant.WERKS)}
              disabled={departments.length === 0}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: allExpanded ? "#8b5cf625" : "#8b5cf615",
                border: `1px ${allExpanded ? "solid" : "dashed"} #8b5cf650`,
                color: "#7c3aed", fontSize: "10px", fontWeight: 700, width: "fit-content",
              }}
            >
              {allExpanded ? (
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1 5h8" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" /></svg>
              ) : (
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" /></svg>
              )}
              <span>{allExpanded ? "collapse" : "dept"}</span>
              {deptList.length > 0 && (
                <span className="px-1 font-black text-white rounded" style={{ fontSize: "8px", background: "#8b5cf6" }}>{deptList.length}</span>
              )}
            </button>
          </div>
        </td>
        {ROLE_COLS.map((col) => (
          <td key={col.key} className="px-3 py-2">
            {!activeRoles ? (
              <div className="w-16 h-3 rounded animate-pulse bg-slate-100" />
            ) : activeRoles[col.key]?.name ? (
              <div className="flex flex-col gap-0.5">
                {col.key === "RAISER"
                  ? parseRaisers(activeRoles[col.key].name).map((r, i) => (
                    <span key={i} className="text-xs font-semibold leading-tight truncate text-slate-800" style={{ maxWidth: "110px" }} title={r}>
                      {i > 0 && <span className="mr-1 text-slate-400" style={{ fontSize: "9px" }}>▸</span>}
                      {r}
                    </span>
                  ))
                  : (
                    <>
                      <span className="text-xs font-semibold leading-tight truncate text-slate-800" style={{ maxWidth: "110px" }} title={activeRoles[col.key].name}>{activeRoles[col.key].name}</span>
                      {activeRoles[col.key].emp_id && (
                        <span className="font-mono" style={{ color: col.color, fontSize: "10px" }}>{activeRoles[col.key].emp_id}</span>
                      )}
                    </>
                  )
                }
              </div>
            ) : (
              <span className="text-xs text-slate-300">—</span>
            )}
          </td>
        ))}
      </motion.tr>
      <AnimatePresence>
        {deptList.map((dept, di) => (
          <DeptSubRow
            key={`${plant.WERKS}-${dept}`}
            dept={dept}
            deptData={deptCache ? (deptCache[dept] ?? (deptLoading ? null : {})) : null}
            onRemove={(d) => onRemoveDept(plant.WERKS, d)}
            typeColor={typeColor}
            isLast={di === deptList.length - 1}
          />
        ))}
      </AnimatePresence>
    </>
  );
}

// ─── APPROVAL OVERVIEW TABLE ──────────────────────────────────────────────────
function ApprovalOverviewTable({ plantOptions, typeColorMap, authHeaders, departments }) {
  const [filterType, setFilterType] = useState("ALL");
  const [bulkData, setBulkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [searchCode, setSearchCode] = useState("");
  const [expandedDepts, setExpandedDepts] = useState({});
  const [deptCache, setDeptCache] = useState({});
  const [deptLoading, setDeptLoading] = useState({});

  const addAllDepts = async (werks) => {
    setExpandedDepts((prev) => ({ ...prev, [werks]: new Set(departments) }));
    if (deptCache[werks]) return;
    setDeptLoading((prev) => ({ ...prev, [werks]: true }));
    try {
      const plantCode = String(werks).slice(0, 4);
      const res = await fetch(`${API_BASE_URL}mrf-plant-users-by-dept?plant=${plantCode}`, { headers: authHeaders() });
      const json = res.ok ? await res.json() : { data: {} };
      setDeptCache((prev) => ({ ...prev, [werks]: json.data ?? {} }));
    } catch {
      setDeptCache((prev) => ({ ...prev, [werks]: {} }));
    } finally {
      setDeptLoading((prev) => ({ ...prev, [werks]: false }));
    }
  };

  const removeDept = (werks, dept) => {
    setExpandedDepts((prev) => {
      const set = new Set(prev[werks] ?? []);
      set.delete(dept);
      return { ...prev, [werks]: set };
    });
  };

  const collapseAllDepts = (werks) => {
    setExpandedDepts((prev) => ({ ...prev, [werks]: new Set() }));
  };

  const hasFetched = useRef(false);
  const uniqueTypes = [...new Set(plantOptions.map((p) => p.TYPE).filter(Boolean))].sort();
  const filteredPlants = plantOptions.filter(
    (p) => (filterType === "ALL" || p.TYPE === filterType) && (searchCode === "" || p.WERKS.toLowerCase().includes(searchCode.toLowerCase()))
  );

  const fetchBulk = async () => {
    setLoading(true); setLoadError(null);
    try {
      const res = await fetch(`${API_BASE_URL}mrf-plant-users-bulk`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setBulkData(json.data || {});
    } catch (err) {
      setLoadError("Failed to load approval users. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (plantOptions.length > 0 && !hasFetched.current) {
      hasFetched.current = true;
      fetchBulk();
    }
  }, [plantOptions]);

  const getTypeColor = (type) => typeColorMap[type] ?? "#64748b";
  const getActiveRoles = (werks) => bulkData ? (bulkData[werks] ?? {}) : null;

  const flowBadge = {
    A: { label: "Flow A", bg: "#3b82f615", border: "#3b82f6", text: "#3b82f6" },
    B: { label: "Flow B", bg: "#ef444415", border: "#ef4444", text: "#ef4444" },
    C: { label: "Flow C", bg: "#f59e0b15", border: "#f59e0b", text: "#f59e0b" },
  };

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
              <h2 className="text-base font-black tracking-tight text-white">Approval Users Overview</h2>
              <p className="text-xs mt-0.5" style={{ color: "#93c5fd" }}>
                All departments shown per plant · Click <span style={{ background: "rgba(139,92,246,0.4)", padding: "0 4px", borderRadius: "4px" }}>＋ dept</span> to expand
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!bulkData) return;
              const headers = ["Plant Code", "Plant Name", "Raiser", "Planning & Qs", "Project Head", "Func. Head", "Sr. President", "Director", "EVC"];
              const rows = filteredPlants.map((p) => {
                const roles = getActiveRoles(p.WERKS) ?? {};
                return [p.WERKS, p.NAME1 ?? "", ...ROLE_KEYS.map((k) => roles[k]?.name ?? "")];
              });
              const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `approval-users-${new Date().toISOString().split("T")[0]}.csv`; a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={!bulkData || loading}
            className="flex items-center flex-shrink-0 gap-2 px-4 py-2 text-xs font-bold transition-all rounded-xl hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.4)" }}
          >
            {loading ? "Loading…" : "⬇ Download CSV"}
          </button>
        </div>
      </div>

      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 flex-wrap">
        <div className="relative flex-shrink-0">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg bg-white focus:outline-none cursor-pointer"
            style={{ border: `1.5px solid ${filterType !== "ALL" ? getTypeColor(filterType) : "#e2e8f0"}`, color: filterType !== "ALL" ? getTypeColor(filterType) : "#475569", minWidth: "140px" }}>
            <option value="ALL">🏭 All Types ({plantOptions.length})</option>
            {uniqueTypes.map((t) => <option key={t} value={t}>{t} ({plantOptions.filter((p) => p.TYPE === t).length})</option>)}
          </select>
        </div>
        <div className="relative flex-shrink-0">
          <input type="text" value={searchCode} onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Plant code…"
            className="pl-3 pr-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none border border-slate-200 bg-white focus:border-blue-300"
            style={{ width: "120px", color: "#1e293b" }} />
        </div>
      </div>

      {loadError && (
        <div className="flex items-center justify-between gap-3 p-3 mx-4 my-3 border border-red-200 rounded-2xl bg-red-50">
          <p className="text-xs font-semibold text-red-700">{loadError}</p>
          <button onClick={() => { hasFetched.current = false; fetchBulk(); }} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl">Retry</button>
        </div>
      )}

      {loading && !bulkData && (
        <div className="px-4 py-6 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-24 h-4 rounded animate-pulse bg-slate-100" />
              {ROLE_KEYS.map((k) => <div key={k} className="flex-1 h-4 rounded animate-pulse bg-slate-100" />)}
            </div>
          ))}
        </div>
      )}

      {(bulkData || (!loading && !loadError)) && (
        <div className="overflow-auto" style={{ maxHeight: "600px" }}>
          <table className="w-full text-left border-collapse" style={{ minWidth: "900px" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th className="px-3 py-2.5 text-left whitespace-nowrap"
                  style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.07em", color: "#1e293b", background: "#f8fafc" }}>
                  <span className="flex items-center gap-1.5">🏭 <span className="uppercase">Plant</span></span>
                </th>
                {ROLE_COLS.map((col) => (
                  <th key={col.key} className="px-3 py-2.5 text-left whitespace-nowrap"
                    style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.07em", color: col.color, background: "#f8fafc" }}>
                    <span className="flex items-center gap-1.5">
                      <span>{col.icon}</span><span className="uppercase">{col.label}</span>
                      {col.key === "FUNC_HEAD" && <span style={{ fontSize: "8px", color: "#ec4899", opacity: 0.7 }}>dept</span>}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPlants.length === 0 ? (
                <tr><td colSpan={TABLE_COLUMNS.length} className="py-10 text-sm text-center text-slate-400">No plants match the current filter.</td></tr>
              ) : (
                filteredPlants.map((p, idx) => (
                  <PlantRow key={p.WERKS} plant={p} idx={idx} departments={departments} typeColor={getTypeColor(p.TYPE)}
                    getActiveRoles={getActiveRoles} flowBadge={flowBadge} expandedDepts={expandedDepts}
                    onAddAll={addAllDepts} onCollapse={collapseAllDepts} onRemoveDept={removeDept}
                    deptCache={deptCache[p.WERKS] ?? null} deptLoading={deptLoading[p.WERKS] ?? false} />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Showing <strong className="text-slate-600">{filteredPlants.length}</strong> of <strong className="text-slate-600">{plantOptions.length}</strong> plants
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function chunkArray(arr, size) {
  const rows = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

// ─── MAIN MRF CONTENT ─────────────────────────────────────────────────────────
function MrfContent() {

  const [userToken] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo')) || {};
  });

  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [replacements, setReplacements] = useState({});
  const [toastMsg, setToastMsg] = useState(null);
  const [toastError, setToastError] = useState(false);

  const [plantOptions, setPlantOptions] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [plantError, setPlantError] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const [approvalUsers, setApprovalUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // ── NEW: position logs (previous user per role) ────────────────────────────
  const [positionLogs, setPositionLogs] = useState({});
  const [loadingLogs, setLoadingLogs] = useState(false);

  const prevPlantRef = useRef("");

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem("userInfo"))?.token ?? null; }
    catch { return null; }
  };
  const authHeaders = () => ({
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
  });

  const showToast = (msg, isError = false) => {
    setToastMsg(msg); setToastError(isError);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchPlants = async () => {
    setLoadingPlants(true); setPlantError(null);
    try {
      const res = await fetch(`${API_BASE_URL}get-plant-details-auth?status=ACTIVE`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPlantOptions(json.data || []);
    } catch { setPlantError("Failed to load plants from SAP. Please try again."); }
    finally { setLoadingPlants(false); }
  };


  //   const fetchPlants = async () => {
  //   setLoadingPlants(true); 
  //   setPlantError(null);

  //   try {
  //     const res = await fetch(`${API_BASE_URL}get-plant-details`, {
  //       method: 'POST', // 1. Change method to POST
  //       headers: {
  //         ...authHeaders(), // 2. Keep your auth headers
  //         'Content-Type': 'application/json', // 3. Tell the server you're sending JSON
  //       },
  //       body: JSON.stringify({ // 4. Add the request body
  //         status: "ACTIVE",
  //         username: userToken.username 
  //       }),
  //     });

  //     if (!res.ok) throw new Error(`HTTP ${res.status}`);

  //     const json = await res.json();
  //     setPlantOptions(json.data || []);
  //   } catch (error) {
  //     setPlantError("Failed to load plants from SAP. Please try again.");
  //   } finally {
  //     setLoadingPlants(false);
  //   }
  // };

  const fetchDepartments = async () => {
    setLoadingDepts(true);
    try {
      const res = await fetch(`${API_BASE_URL}dept`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setDepartments((json.departments || []).map((d) => d.DEPT).filter(Boolean));
    } catch { /* silent */ }
    finally { setLoadingDepts(false); }
  };

  const fetchApprovalUsers = async (plantCode, department = "") => {
    setLoadingUsers(true); setUsersError(null); setApprovalUsers({});
    try {
      let url = `${API_BASE_URL}mrf-plant-users?plant=${plantCode}`;
      if (department) url += `&department=${encodeURIComponent(department)}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setApprovalUsers(json.data || {});
    } catch { setUsersError("Could not load approval users for this plant."); }
    finally { setLoadingUsers(false); }
  };

  // ── NEW: fetch latest position log per role for this plant ─────────────────
  /**
   * Calls GET /api/mrf-position-logs?plant=XXXX
   * Expected response: { data: { RAISER: {...log}, GM: {...log}, ... } }
   * where each log has: { PREVIOUS_USER, NEW_NAME, NEW_EMP_ID, APPLICABLE_DATE, created_at, CHANGE_POSITION }
   *
   * For indexed raisers (RAISER_0, RAISER_1) the backend should key them separately.
   */
  const fetchPositionLogs = async (plantCode) => {
    setLoadingLogs(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}mrf-position-logs?plant=${plantCode}`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Normalise: key by CHANGE_POSITION
      setPositionLogs(json.data || {});
    } catch {
      setPositionLogs({});
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => { fetchPlants(); fetchDepartments(); }, []);

  useEffect(() => {
    if (!selectedPlant) { setApprovalUsers({}); setUsersError(null); setPositionLogs({}); return; }
    const plantChanged = prevPlantRef.current !== selectedPlant;
    prevPlantRef.current = selectedPlant;
    if (plantChanged) {
      setReplacements({});
      fetchPositionLogs(selectedPlant.slice(0, 4));
    }
    fetchApprovalUsers(selectedPlant.slice(0, 4), selectedDept);
  }, [selectedPlant, selectedDept]);

  const handleReplace = async (roleKey, data) => {
    const res = await fetch(`${API_BASE_URL}mrf-position-change`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        plant: selectedPlant,
        position_key: roleKey,
        new_username: data.username,
        new_name: data.name,
        new_emp_id: data.emp_id,
        applicable_date: data.date,
        department: selectedDept || "",
      }),
    });
    const json = await res.json();
    if (!res.ok || json.status >= 400) throw new Error(json.message ?? "Server error");
    setReplacements((prev) => ({ ...prev, [roleKey]: data }));
    const label = json.applied_now
      ? `${roleKey} → ${data.name} applied immediately ✓`
      : `${roleKey} → ${data.name} scheduled for ${data.date} ✓`;
    showToast(label);
    if (json.applied_now) {
      fetchApprovalUsers(selectedPlant.slice(0, 4), selectedDept);
      // Refresh logs so previous user updates immediately
      fetchPositionLogs(selectedPlant.slice(0, 4));
    }
  };

  const plant = plantOptions.find((p) => p.WERKS === selectedPlant);
  const flowType = plant ? getFlow(plant.WERKS) : null;
  const effectiveSteps = buildEffectiveSteps(flowType, approvalUsers);

  const raiserStep = effectiveSteps.find((s) => s.key === "RAISER");
  const raiserSlots = raiserStep ? buildRaiserSlots(approvalUsers["RAISER"]) : [];
  const nonRaiserSteps = effectiveSteps.filter((s) => s.key !== "RAISER" && !!approvalUsers[s.key]);
  const TYPE_ORDER = [
    "HO",
    "PROJECTS",
    "RMC",
    "MAINTAIN",
    "COMM.PROJ.",
    "COMM.MAIN.",
    "PRECAST",
    "CENT.YARD",
  ];

  const rawTypes = [...new Set(plantOptions.map((p) => p.TYPE?.trim()).filter(Boolean))];
  const uniqueTypes = [
    ...TYPE_ORDER.filter((t) => rawTypes.includes(t)),
    ...rawTypes.filter((t) => !TYPE_ORDER.includes(t)).sort(),
  ];
  const typeColorMap = Object.fromEntries(uniqueTypes.map((t, i) => [t, TYPE_PALETTE[i % TYPE_PALETTE.length]]));
  const getTypeColor = (type) => typeColorMap[type] ?? "#64748b";
  const filteredPlants = plantOptions.filter((p) => filterType === "ALL" || p.TYPE === filterType);

  const flowBadge = {
    A: { label: "Flow A", bg: "#3b82f615", border: "#3b82f6", text: "#3b82f6" },
    B: { label: "Flow B", bg: "#ef444415", border: "#ef4444", text: "#ef4444" },
    C: { label: "Flow C", bg: "#f59e0b15", border: "#f59e0b", text: "#f59e0b" },
  };

  const tabList = [
    { key: "ALL", label: "All Plants", count: plantOptions.length },
    ...uniqueTypes.map((t) => ({ key: t, label: t, count: plantOptions.filter((p) => p.TYPE === t).length })),
  ];

  const legendBase = (f) => FLOW_STEPS[f].filter((s) => !s.optional);
  const legendFull = (f) => FLOW_STEPS[f];

  const handleSelectPlant = (werks) => { setSelectedDept(""); setSelectedPlant(werks); };
  const handleClear = () => { setSelectedPlant(""); setSelectedDept(""); setReplacements({}); setPositionLogs({}); prevPlantRef.current = ""; };

  return (
    <div className="space-y-6">
      {/* Plant Selection */}
      <div className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200">
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1d4ed8 100%)" }}>
          <div className="absolute w-32 h-32 rounded-full -top-6 -right-6 opacity-10" style={{ background: "radial-gradient(circle,#60a5fa,transparent)" }} />
          <div className="relative flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 22V12h6v10" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="text-lg font-black tracking-tight text-white">MRF Authorization</h1>
            </div>
            <div className="flex items-center flex-shrink-0 gap-3">
              {!loadingPlants && !plantError && (
                <div className="text-right">
                  <p className="text-2xl font-black leading-none text-white">{plantOptions.length}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: "#93c5fd" }}>active plants</p>
                </div>
              )}
              {selectedPlant && (
                <button onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {loadingPlants && (
          <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-400">
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
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
            <div className="flex flex-wrap items-center gap-3 px-4 pt-3 pb-2">
              {/* Plant type tabs */}
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

              {/* Department dropdown — only shown when a plant is selected */}
              {selectedPlant && (
                <div className="flex-shrink-0 flex items-center gap-1.5">
                  <div className="relative">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M4 8h8M6 12h4" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      disabled={loadingDepts}
                      className="appearance-none pl-7 pr-7 py-1.5 text-xs font-semibold rounded-lg focus:outline-none cursor-pointer transition-all"
                      style={{
                        border: `1.5px solid ${selectedDept ? "#8b5cf6" : "#e2e8f0"}`,
                        background: selectedDept ? "#f5f3ff" : "white",
                        color: selectedDept ? "#7c3aed" : "#64748b",
                        minWidth: "140px",
                        boxShadow: selectedDept ? "0 0 0 3px #8b5cf620" : "none",
                      }}
                    >
                      <option value="">🏢 All Depts</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {/* Chevron */}
                    <div className="absolute -translate-y-1/2 pointer-events-none right-2 top-1/2">
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4l4 4 4-4" stroke={selectedDept ? "#8b5cf6" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  {/* Clear dept button */}
                  {selectedDept && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSelectedDept("")}
                      className="flex items-center justify-center w-6 h-6 transition-colors rounded-lg hover:bg-red-50"
                      style={{ border: "1.5px solid #ef444430", background: "#ef444410" }}
                      title="Clear department filter"
                    >
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1l8 8M9 1L1 9" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            <div className="px-3 pt-1 pb-3 overflow-y-auto" style={{ maxHeight: "240px" }}>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
                {filteredPlants.length === 0 ? (
                  <p className="py-8 text-xs text-center col-span-full text-slate-400">No active plants found for this type.</p>
                ) : filteredPlants.map((p) => {
                  const flow = getFlow(p.WERKS);
                  const badge = flowBadge[flow];
                  const isSelected = selectedPlant === p.WERKS;
                  const typeColor = getTypeColor(p.TYPE);
                  return (
                    <motion.button key={p.WERKS} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectPlant(p.WERKS)}
                      className="text-left transition-all duration-200 border-2"
                      style={{ padding: "6px 10px", borderRadius: "8px", borderColor: isSelected ? typeColor : `${typeColor}30`, background: isSelected ? `linear-gradient(135deg, ${typeColor}18, ${typeColor}08)` : `${typeColor}07`, boxShadow: isSelected ? `0 2px 10px ${typeColor}25` : "none" }}>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span style={{ fontSize: "9px", fontWeight: 800, color: typeColor }}>{p.TYPE}</span>
                        <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "4px", border: `1px solid ${badge.border}50`, background: badge.bg, color: badge.text }}>{badge.label}</span>
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

      {/* Flow Result + Approval Positions */}
      <AnimatePresence mode="wait">
        {plant && flowType && (
          <motion.div key={`${selectedPlant}-${selectedDept}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200">
              <div className="p-5 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{plant.WERKS} — {plant.NAME1}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Approval flow for {plant.TYPE} plants</p>
                  </div>
                  <div className="px-4 py-2 text-sm font-black border-2 rounded-2xl"
                    style={{ borderColor: flowBadge[flowType].border, color: flowBadge[flowType].text, background: flowBadge[flowType].bg }}>
                    {flowType === "A" && "Flow A — HO Plants"}
                    {flowType === "B" && "Flow B — Project Plants"}
                    {flowType === "C" && "Flow C — Standard Plants"}
                  </div>
                </div>
                <div className="p-3 border rounded-2xl bg-slate-50 border-slate-100">
                  {loadingUsers ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                      Loading flow…
                    </div>
                  ) : <FlowDiagram steps={effectiveSteps} flowType={flowType} />}
                </div>
              </div>

              <div className="border-t border-slate-100">
                <div className="px-5 py-2.5 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full" />
                  <h2 className="text-sm font-bold text-slate-800">Approval Positions</h2>
                  <span className="flex items-center gap-1 ml-auto text-xs font-normal text-slate-400">
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
                          <path d="M8 4v4l2.5 2.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                          <circle cx="8" cy="8" r="6.5" stroke="#94a3b8" strokeWidth="1.5" />
                        </svg>
                        Click any position to view history &amp; manage
                      </>
                    )}
                  </span>
                </div>
              </div>

              {loadingUsers && (
                <div className="flex items-center justify-center gap-3 py-8 text-sm text-slate-400">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  Loading approval users…
                </div>
              )}

              {usersError && !loadingUsers && (
                <div className="flex items-center justify-between gap-3 p-3 mx-4 mb-4 border rounded-2xl bg-amber-50 border-amber-200">
                  <p className="text-xs font-semibold text-amber-700">{usersError}</p>
                  <button onClick={() => fetchApprovalUsers(selectedPlant.slice(0, 4), selectedDept)}
                    className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl">Retry</button>
                </div>
              )}

              {!loadingUsers && (
                <div className="px-4 pt-1 pb-4 space-y-3">
                  {!raiserStep && nonRaiserSteps.length === 0 ? (
                    <p className="py-6 text-sm text-center text-slate-400">No approval users configured for this plant.</p>
                  ) : (
                    <>
                      {/* ── RAISER ROW ─────────────────────────────────────────── */}
                      {raiserStep && (
                        raiserSlots.length > 1 ? (
                          <div className="w-full">
                            <MultiRaiserCards
                              step={raiserStep}
                              stepNumber={effectiveSteps.findIndex((s) => s.key === "RAISER") + 1}
                              raiserSlots={raiserSlots}
                              onReplace={handleReplace}
                              positionLogs={positionLogs}
                            />
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <MultiRaiserCards
                              step={raiserStep}
                              stepNumber={effectiveSteps.findIndex((s) => s.key === "RAISER") + 1}
                              raiserSlots={raiserSlots}
                              onReplace={handleReplace}
                              positionLogs={positionLogs}
                            />
                            {nonRaiserSteps.length > 0 ? (() => {
                              const firstNon = nonRaiserSteps[0];
                              const firstNonIdx = effectiveSteps.findIndex((s) => s.key === firstNon.key);
                              return (
                                <UserCard
                                  key={firstNon.key}
                                  step={firstNon}
                                  stepNumber={firstNonIdx + 1}
                                  user={approvalUsers[firstNon.key] ?? null}
                                  onReplace={(data) => handleReplace(firstNon.key, data)}
                                  prevLog={positionLogs[firstNon.key] ?? null}
                                />
                              );
                            })() : <div className="flex-1" />}
                          </div>
                        )
                      )}

                      {/* ── NON-RAISER STEPS in 2-col rows ───────────────────── */}
                      {chunkArray(
                        raiserSlots.length === 1 ? nonRaiserSteps.slice(1) : nonRaiserSteps,
                        2
                      ).map((pair, rowIdx) => (
                        <div key={rowIdx} className="flex items-start gap-3">
                          {pair.map((step) => {
                            const stepIndex = effectiveSteps.findIndex((s) => s.key === step.key);
                            return (
                              <UserCard
                                key={step.key}
                                step={step}
                                stepNumber={stepIndex + 1}
                                user={approvalUsers[step.key] ?? null}
                                onReplace={(data) => handleReplace(step.key, data)}
                                prevLog={positionLogs[step.key] ?? null}
                              />
                            );
                          })}
                          {pair.length === 1 && <div className="flex-1" />}
                        </div>
                      ))}
                    </>
                  )}

                  {/* Replacement log */}
                  {Object.keys(replacements).length > 0 && (
                    <div className="pt-1 space-y-1">
                      {Object.entries(replacements).map(([roleKey, data]) => {
                        const baseKey = roleKey.replace(/_\d+$/, "");
                        const step = effectiveSteps.find((s) => s.key === baseKey);
                        const isIndexed = /RAISER_\d+/.test(roleKey);
                        const slotNum = isIndexed ? parseInt(roleKey.split("_").pop(), 10) + 1 : null;
                        return step ? (
                          <motion.div key={roleKey} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="px-3 py-1.5 rounded-xl flex items-center gap-2"
                            style={{ background: `${step.color}10`, border: `1px dashed ${step.color}50` }}>
                            <span className="text-xs" style={{ color: step.color }}>
                              ↳ <strong>{isIndexed ? `Raiser ${slotNum}` : roleKey}</strong> → <strong>{data.name}</strong> ({data.emp_id}) from <strong>{data.date}</strong>
                            </span>
                          </motion.div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flow Legend */}
      <div className="p-5 bg-white border shadow-sm rounded-3xl border-slate-200">
        <h3 className="mb-4 text-sm font-bold tracking-wide uppercase text-slate-700">Flow Reference</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-4 p-3 border rounded-2xl"
            style={{ borderColor: flowBadge.A.border + "40", background: flowBadge.A.bg }}>
            <div className="flex-shrink-0 w-52">
              <p className="text-xs font-black tracking-wide uppercase" style={{ color: flowBadge.A.text }}>Flow A — HO Plants</p>
              <p className="text-xs text-slate-400 mt-0.5">2000, 2150, 2250</p>
              <p className="text-xs mt-1.5 text-slate-400 italic">Fixed flow — dept has no effect</p>
            </div>
            <div className="self-stretch flex-shrink-0 w-px" style={{ background: flowBadge.A.border + "40" }} />
            <div className="flex-1"><FlowDiagram steps={legendBase("A")} flowType="A" /></div>
          </div>
          {["B", "C"].map((f) => (
            <div key={f} className="flex items-start gap-4 p-3 border rounded-2xl"
              style={{ borderColor: flowBadge[f].border + "40", background: flowBadge[f].bg }}>
              <div className="flex-shrink-0 w-52">
                <p className="text-xs font-black tracking-wide uppercase" style={{ color: flowBadge[f].text }}>
                  {f === "B" ? "Flow B — Project Plants (3001, 4001)" : "Flow C — All other plants"}
                </p>
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#ec4899" }}>
                  <span>⚙️</span> Func. Head after Planning & Qs (dept only)
                </p>
              </div>
              <div className="self-stretch flex-shrink-0 w-px" style={{ background: flowBadge[f].border + "40" }} />
              <div className="flex-1 space-y-2">
                <div><p className="mb-1 text-xs text-slate-400">No dept / no FUNC_USR:</p><FlowDiagram steps={legendBase(f)} flowType={f} /></div>
                <div><p className="mb-1 text-xs text-slate-400">Dept with FUNC_USR:</p><FlowDiagram steps={legendFull(f)} flowType={f} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overview Table */}
      {!loadingPlants && !plantError && plantOptions.length > 0 && (
        <ApprovalOverviewTable plantOptions={plantOptions} typeColorMap={typeColorMap} authHeaders={authHeaders} departments={departments} />
      )}

      {/* Toast */}
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

// ─── ROOT EXPORT ──────────────────────────────────────────────────────────────
export default function MrfChange() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleSelect = (key) => {
    if (key === "indent") {
      navigate("/indentflow");
    } else {
      setSelected("mrf");
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthorizationLanding onSelect={handleSelect} />
          </motion.div>
        ) : (
          <motion.div key="mrf-content" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="px-6 pt-6 mx-auto max-w-7xl">
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-2 px-4 py-2 mb-4 text-sm font-bold transition-all rounded-xl hover:shadow-md"
                style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Authorization
              </button>
            </div>
            <div className="px-6 pb-8 mx-auto max-w-7xl">
              <MrfContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}