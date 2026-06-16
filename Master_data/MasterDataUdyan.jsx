import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, ChevronDown, ChevronUp, Layers, Users, BarChart2, Hash, ArrowLeft, Factory, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../Config";


const DEPT_COLORS = [
  { bg: "#e8f4fd", accent: "#1a6fb5", light: "#b3d7f5" },
  { bg: "#edf7ee", accent: "#1e7e34", light: "#a8d8ac" },
  { bg: "#fef6e8", accent: "#b8660a", light: "#f5d49a" },
  { bg: "#fdedf0", accent: "#b5193c", light: "#f5aaba" },
  { bg: "#f0ecfd", accent: "#5b21b6", light: "#c4b5f5" },
  { bg: "#ecfdf5", accent: "#0f766e", light: "#99e6d8" },
  { bg: "#fefce8", accent: "#854d0e", light: "#fde68a" },
  { bg: "#fff1f2", accent: "#9f1239", light: "#fda4af" },
  { bg: "#f0f9ff", accent: "#075985", light: "#bae6fd" },
  { bg: "#fdf4ff", accent: "#7e22ce", light: "#e9d5ff" },
  { bg: "#fff7ed", accent: "#c2410c", light: "#fed7aa" },
  { bg: "#f0fdf4", accent: "#166534", light: "#bbf7d0" },
];

export default function MasterDataUdyan() {
  const navigate = useNavigate();

  const [userToken] = useState(() => {
    const s = localStorage.getItem("userInfo");
    return s ? JSON.parse(s) : null;
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [plantFilter, setPlantFilter] = useState("");
  const [expandedDept, setExpandedDept] = useState(null);
  const [viewMode, setViewMode] = useState("grouped");

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}master-data-udyan`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${userToken?.token}`,
        },
      });
      setData(res.data.data || []);
    } catch (err) {
      setError("Unable to load data. Please check the server and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getDisplayTotal = (row) => plantFilter ? row.TOTAL_PLAN : row.TOTAL_ALL;

  // ── Derived ─────────────────────────────────────────────────────────────
  const deptList = useMemo(() => [...new Set(data.map(r => r.DEPT))].sort(), [data]);
  const plantList = useMemo(() =>
    [...new Set(data.map(r => r.PLANT).filter(Boolean))].sort(),
    [data]);

  const filtered = useMemo(() => {
    // When a plant is selected, show only that plant's rows
    // When no plant selected, dedupe by SNO (one row per position)
    let rows = plantFilter
      ? data.filter(r => r.PLANT === plantFilter)
      : [...new Map(data.map(r => [r.SNO, r])).values()];

    return rows.filter(r => {
      const total = plantFilter ? r.TOTAL_PLAN : r.TOTAL_ALL;
      if (deptFilter && r.DEPT !== deptFilter) return false;
      if (planFilter === "active" && total === 0) return false;
      if (planFilter === "zero" && total > 0) return false;
      if (search && !r.POSITION.toLowerCase().includes(search.toLowerCase()) &&
        !r.DEPT.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, deptFilter, planFilter, plantFilter, search]);

  // ── FIX: Only group by plant when a plant filter is explicitly selected ──
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(r => {
      const key = (plantFilter && r.PLANT) ? `${r.DEPT} — ${r.PLANT}` : r.DEPT;
      if (!map[key]) map[key] = { code: r.CODES, dept: r.DEPT, plant: plantFilter ? r.PLANT : null, rows: [] };
      map[key].rows.push(r);
    });
    return map;
  }, [filtered, plantFilter]);

  // ── Summary ─────────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const uniquePositions = plantFilter
      ? filtered
      : [...new Map(data.map(r => [r.SNO, r])).values()];

    return {
      depts: [...new Set(uniquePositions.map(r => r.DEPT))].length,
      positions: uniquePositions.length,
      totalPlan: uniquePositions.reduce((s, r) => s + (plantFilter ? r.TOTAL_PLAN : r.TOTAL_ALL), 0),
      filled: uniquePositions.filter(r => (plantFilter ? r.TOTAL_PLAN : r.TOTAL_ALL) > 0).length,
    };
  }, [data, filtered, plantFilter]);

  const resetFilters = () => {
    setSearch("");
    setDeptFilter("");
    setPlanFilter("");
    setPlantFilter("");
  };
  const downloadExcel = () => {
  const currentPlantFilter = plantFilter; // capture explicitly

  const rows = filtered.map((row, idx) => ({
    "S.No": idx + 1,
    "Plant": currentPlantFilter ? row.PLANT : row.PLANT,  // use captured value
    "Code": row.CODES,
    "Sub Code": row.SUB_CODES,
    "Department": row.DEPT,
    "Position": row.POSITION,
    "Total Plan": currentPlantFilter ? row.TOTAL_PLAN : row.TOTAL_ALL, // don't use getDisplayTotal
  }));

  rows.push({
    "S.No": "", "Plant": "", "Code": "", "Sub Code": "",
    "Department": "", "Position": "TOTAL",
    "Total Plan": filtered.reduce((s, r) => s + (currentPlantFilter ? r.TOTAL_PLAN : r.TOTAL_ALL), 0),
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 6 }, { wch: 20 }, { wch: 10 },
    { wch: 12 }, { wch: 24 }, { wch: 36 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Master Data");
  XLSX.writeFile(wb, `MasterData_${currentPlantFilter || "AllPlants"}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#f4f6fb", minHeight: "100vh" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: #c0c8d8; border-radius: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .trow:hover td { background: #f0f6ff !important; }
        .plant-select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0a4a7a 100%)",
        padding: "0 2rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", minHeight: 68, gap: 16,
        boxShadow: "0 4px 24px rgba(15,23,42,0.22)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate(-1)} style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8, padding: "6px 14px", color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500,
            fontFamily: "inherit", transition: "background 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Layers size={18} color="#fff" />
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
                Manpower Planning
              </div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
                Master Data
              </div>
            </div>
          </div>
        </div>

        {/* Summary pills */}
        {!loading && !error && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {plantFilter && (
              <div style={{
                background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)",
                borderRadius: 8, padding: "5px 12px",
                display: "flex", alignItems: "center", gap: 6
              }}>
                <Factory size={12} color="#fbbf24" />
                <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: 12 }}>{plantFilter}</span>
              </div>
            )}
            {[
              { icon: <Layers size={12} />, val: summary.depts, label: "Depts", c: "#60a5fa" },
              { icon: <Hash size={12} />, val: summary.positions, label: "Positions", c: "#22d3ee" },
              { icon: <BarChart2 size={12} />, val: summary.totalPlan, label: "Plan", c: "#fbbf24" },
              { icon: <Users size={12} />, val: summary.filled, label: "Staffed", c: "#34d399" },
            ].map(p => (
              <div key={p.label} style={{
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 8, padding: "5px 12px",
                display: "flex", alignItems: "center", gap: 6
              }}>
                <span style={{ color: p.c }}>{p.icon}</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{p.val}</span>
                <span style={{ color: "rgba(255,255,255,0.42)", fontSize: 11, fontWeight: 500 }}>{p.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FILTER BAR ─────────────────────────────────────────────────────── */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e4e8f0",
        padding: "12px 2rem", display: "flex", alignItems: "center",
        gap: 10, flexWrap: "wrap"
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 280 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search position or dept…"
            style={{
              width: "100%", padding: "8px 10px 8px 30px",
              border: "1.5px solid #e2e8f0", borderRadius: 8, fontFamily: "inherit",
              fontSize: 13, color: "#1e293b", outline: "none", transition: "border 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>

        {/* Plant Dropdown */}
        <div style={{ position: "relative" }}>
          <Factory size={13} style={{
            position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
            color: plantFilter ? "#f59e0b" : "#94a3b8", pointerEvents: "none", zIndex: 1
          }} />
          <select
            value={plantFilter}
            onChange={e => { setPlantFilter(e.target.value); setDeptFilter(""); }}
            className="plant-select"
            style={{
              padding: "8px 10px 8px 28px",
              border: `1.5px solid ${plantFilter ? "#f59e0b" : "#e2e8f0"}`,
              borderRadius: 8, fontSize: 13,
              color: plantFilter ? "#92400e" : "#1e293b",
              background: plantFilter ? "#fffbeb" : "#fff",
              outline: "none", fontFamily: "inherit",
              minWidth: 160, cursor: "pointer",
              fontWeight: plantFilter ? 600 : 400,
              transition: "all 0.2s"
            }}
          >
            <option value="">All Plants</option>
            {plantList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Department */}
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{
          padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8,
          fontSize: 13, color: "#1e293b", background: "#fff", outline: "none",
          fontFamily: "inherit", minWidth: 150, cursor: "pointer"
        }}>
          <option value="">All Departments</option>
          {[...new Set(
            (plantFilter ? data.filter(r => r.PLANT === plantFilter) : data).map(r => r.DEPT)
          )].sort().map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} style={{
          padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8,
          fontSize: 13, color: "#1e293b", background: "#fff", outline: "none",
          fontFamily: "inherit", minWidth: 140, cursor: "pointer"
        }}>
          <option value="">All Headcount</option>
          <option value="active">Has Headcount</option>
          <option value="zero">No Headcount</option>
        </select>

        <button onClick={resetFilters} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
          background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRadius: 8,
          fontSize: 13, color: "#64748b", cursor: "pointer", fontFamily: "inherit", fontWeight: 500
        }}>
          <RefreshCw size={12} /> Reset
        </button>

        {/* View Toggle */}
        <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          {["grouped", "table"].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: "none", fontFamily: "inherit", textTransform: "capitalize",
              background: viewMode === m ? "#0f172a" : "#fff",
              color: viewMode === m ? "#fff" : "#64748b",
              transition: "all 0.2s"
            }}>{m}</button>
          ))}
        </div>

        <button onClick={fetchData} style={{
          display: "flex", alignItems: "center", gap: 6, marginLeft: "auto",
          padding: "8px 16px",
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          border: "none", borderRadius: 8,
          fontSize: 13, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
          boxShadow: "0 2px 8px rgba(59,130,246,0.3)"
        }}>
          <RefreshCw size={13} /> Refresh
        </button>
        <button onClick={downloadExcel} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px",
          background: "linear-gradient(135deg, #16a34a, #15803d)",
          border: "none", borderRadius: 8,
          fontSize: 13, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
          boxShadow: "0 2px 8px rgba(22,163,74,0.3)"
        }}>
          <Download size={13} /> Export
        </button>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: "1.5rem 2rem", maxWidth: 1400, margin: "0 auto" }}>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div style={{
              width: 44, height: 44, border: "4px solid #e2e8f0",
              borderTop: "4px solid #3b82f6", borderRadius: "50%",
              animation: "spin 0.8s linear infinite"
            }} />
            <p style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>Loading master data…</p>
          </div>
        )}

        {error && !loading && (
          <div style={{
            background: "#fff1f2", border: "1.5px solid #fecdd3",
            borderRadius: 12, padding: 32, textAlign: "center"
          }}>
            <p style={{ color: "#e11d48", fontWeight: 600, marginBottom: 12 }}>{error}</p>
            <button onClick={fetchData} style={{
              padding: "9px 20px", background: "#e11d48", color: "#fff",
              border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontWeight: 600
            }}>Retry</button>
          </div>
        )}

        {/* ── GROUPED VIEW ── */}
        {!loading && !error && viewMode === "grouped" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Object.keys(grouped).length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>
                No positions match the current filters.
              </div>
            )}
            {Object.entries(grouped).map(([deptKey, grp], di) => {
              const { code, dept, plant, rows } = grp;
              const palette = DEPT_COLORS[di % DEPT_COLORS.length];
              const deptTotal = rows.reduce((s, r) => s + getDisplayTotal(r), 0);
              const isOpen = expandedDept === deptKey || (deptFilter === dept && expandedDept !== "__closed__" + deptKey);

              return (
                <motion.div key={deptKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: di * 0.035, duration: 0.28 }}
                  style={{
                    background: "#fff", borderRadius: 12,
                    border: `1.5px solid ${isOpen ? palette.accent + "44" : "#e4e8f0"}`,
                    overflow: "hidden",
                    boxShadow: isOpen ? `0 4px 20px ${palette.accent}15` : "0 1px 4px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.2s, border-color 0.2s"
                  }}
                >
                  {/* Dept header */}
                  <div onClick={() => setExpandedDept(expandedDept === deptKey ? null : deptKey)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "13px 18px", cursor: "pointer",
                      background: isOpen ? palette.bg : "#fff",
                      borderBottom: isOpen ? `1px solid ${palette.light}` : "none",
                      transition: "background 0.2s"
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: palette.accent, flexShrink: 0 }} />
                    <span style={{
                      background: palette.accent, color: "#fff",
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                      padding: "2px 7px", borderRadius: 4, flexShrink: 0
                    }}>{code}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", flex: 1 }}>
                      {dept}
                      {/* Show All Plants badge by default, specific plant when selected */}
                      <span style={{
                        marginLeft: 8, fontSize: 10, fontWeight: 600,
                        background: plantFilter ? "#fffbeb" : "#f0f9ff",
                        color: plantFilter ? "#92400e" : "#075985",
                        border: `1px solid ${plantFilter ? "#fde68a" : "#bae6fd"}`,
                        padding: "1px 7px", borderRadius: 4,
                        verticalAlign: "middle"
                      }}>
                        <Factory size={9} style={{ display: "inline", marginRight: 3 }} />
                        {plantFilter ? plant : "All Plants"}
                      </span>
                    </span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      <strong style={{ color: "#0f172a" }}>{rows.length}</strong> positions
                    </span>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: palette.accent,
                      background: palette.bg, border: `1px solid ${palette.light}`,
                      padding: "2px 10px", borderRadius: 20
                    }}>{deptTotal} planned</span>
                    {isOpen ? <ChevronUp size={15} color="#64748b" /> : <ChevronDown size={15} color="#64748b" />}
                  </div>

                  {/* Position cards */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))",
                          gap: 1, background: "#eef0f5", padding: 1
                        }}>
                          {rows.map((row, ri) => (
                            <motion.div key={row.SNO}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: ri * 0.018 }}
                              style={{
                                background: "#fff", padding: "13px 15px",
                                display: "flex", flexDirection: "column", gap: 7,
                                borderLeft: `3px solid ${row.TOTAL_PLAN > 0 ? palette.accent : "#e2e8f0"}`,
                                transition: "background 0.15s", cursor: "default"
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = palette.bg}
                              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", lineHeight: 1.4, flex: 1 }}>
                                  {row.POSITION}
                                </span>
                                <span style={{
                                  fontSize: 22, fontWeight: 800, lineHeight: 1,
                                  color: getDisplayTotal(row) > 0 ? palette.accent : "#d1d5db",
                                  flexShrink: 0
                                }}>{getDisplayTotal(row)}</span>
                              </div>
                              <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{
                                  fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
                                  background: "#f1f5f9", color: "#64748b",
                                  padding: "2px 7px", borderRadius: 4
                                }}>{row.SUB_CODES}</span>
                                <span style={{ fontSize: 10, color: "#94a3b8", background: "#f8fafc", padding: "2px 7px", borderRadius: 4 }}>
                                  #{row.SNO}
                                </span>
                                {/* ── FIX: Only show plant tag on cards when a plant IS selected ── */}
                                {plantFilter && row.PLANT && (
                                  <span style={{
                                    fontSize: 10, fontWeight: 600,
                                    background: "#fffbeb", color: "#92400e",
                                    border: "1px solid #fde68a",
                                    padding: "2px 7px", borderRadius: 4,
                                    display: "flex", alignItems: "center", gap: 3
                                  }}>
                                    <Factory size={9} /> {row.PLANT}
                                  </span>
                                )}
                                <span style={{
                                  marginLeft: "auto", fontSize: 10, fontWeight: 600,
                                  color: row.TOTAL_PLAN > 0 ? palette.accent : "#94a3b8"
                                }}>
                                  {getDisplayTotal(row) > 0 ? "● Planned" : "○ TBD"}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── TABLE VIEW ── */}
        {!loading && !error && viewMode === "table" && (() => {
          const totalPositions = filtered.length;
          const totalPlanned = filtered.reduce((s, r) => s + getDisplayTotal(r), 0);
          return (
            <div style={{
              background: "#fff", borderRadius: 12, overflow: "hidden",
              border: "1.5px solid #e4e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
            }}>
              <div style={{ overflowX: "auto", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{
                      background: "linear-gradient(135deg, #0f172a, #1e3a5f)",
                      position: "sticky", top: 0, zIndex: 2
                    }}>
                      {["S.No", "Plant", "Code", "Department", "Sub Code", "Position", "Total Plan"].map(h => (
                        <th key={h} style={{
                          padding: "9px 12px", textAlign: "left",
                          color: "rgba(255,255,255,0.8)", fontWeight: 600,
                          fontSize: 11, letterSpacing: "0.05em", whiteSpace: "nowrap",
                          borderRight: "1px solid rgba(255,255,255,0.07)"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
                          No positions match the filters.
                        </td>
                      </tr>
                    )}
                    {filtered.map((row, idx) => {
                      const deptIdx = deptList.indexOf(row.DEPT);
                      const palette = DEPT_COLORS[deptIdx % DEPT_COLORS.length];
                      const sno = String(idx + 1).padStart(2, "0");
                      return (
                        <tr key={row.SNO} className="trow" style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "7px 12px", color: "#94a3b8", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>
                            {sno}
                          </td>
                          <td style={{ padding: "7px 12px" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 3,
                              background: plantFilter ? "#fffbeb" : "#f0f9ff",
                              color: plantFilter ? "#92400e" : "#075985",
                              border: `1px solid ${plantFilter ? "#fde68a" : "#bae6fd"}`,
                              padding: "1px 7px", borderRadius: 4,
                              fontSize: 10, fontWeight: 600, whiteSpace: "nowrap"
                            }}>
                              <Factory size={9} />
                              {plantFilter ? row.PLANT : "All Plants"}
                            </span>
                          </td>
                          <td style={{ padding: "7px 12px" }}>
                            <span style={{
                              background: palette.bg, color: palette.accent,
                              border: `1px solid ${palette.light}`,
                              padding: "1px 6px", borderRadius: 4,
                              fontSize: 10, fontWeight: 700, letterSpacing: "0.06em"
                            }}>{row.CODES}</span>
                          </td>
                          <td style={{ padding: "7px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: palette.accent, flexShrink: 0 }} />
                              <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 12 }}>{row.DEPT}</span>
                            </div>
                          </td>
                          <td style={{ padding: "7px 12px", color: "#64748b", fontFamily: "monospace", fontSize: 11 }}>
                            {row.SUB_CODES}
                          </td>
                          <td style={{ padding: "7px 12px", color: "#374151", fontWeight: 500, fontSize: 12 }}>{row.POSITION}</td>
                          <td style={{ padding: "7px 12px" }}>
                            <span style={{
                              display: "inline-block", minWidth: 32, textAlign: "center",
                              padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                              background: getDisplayTotal(row) > 0 ? palette.bg : "#f8fafc",
                              color: getDisplayTotal(row) > 0 ? palette.accent : "#94a3b8",
                              border: `1px solid ${getDisplayTotal(row) > 0 ? palette.light : "#e2e8f0"}`
                            }}>{getDisplayTotal(row)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* ── TOTALS FOOTER ── */}
                  {filtered.length > 0 && (
                    <tfoot>
                      <tr style={{
                        background: "linear-gradient(135deg, #0f172a, #1e3a5f)",
                        position: "sticky", bottom: 0, zIndex: 2
                      }}>
                        <td colSpan={5} style={{ padding: "10px 12px" }}>
                          <span style={{
                            color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em"
                          }}>TOTAL</span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: "rgba(99,179,237,0.15)", border: "1px solid rgba(99,179,237,0.3)",
                            borderRadius: 20, padding: "3px 10px"
                          }}>
                            <Users size={11} color="#60a5fa" />
                            <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{totalPositions}</span>
                            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>positions</span>
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)",
                            borderRadius: 20, padding: "3px 10px"
                          }}>
                            <BarChart2 size={11} color="#fbbf24" />
                            <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{totalPlanned}</span>
                            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>planned</span>
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}