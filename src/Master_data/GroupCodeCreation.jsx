import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL } from "../Config";

const EMPTY_CREATE_ROW = { dept: '', code: '' };
const EMPTY_CHANGE_ROW = { code: '', dept: '' };

// Validate: exactly 2 uppercase letters followed by 2 digits (e.g. AB01)
const CODE_REGEX = /^[A-Z]{2}[0-9]{2}$/;

const GroupCode = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('creation');

    // ── Auth token ──
    const userToken = (() => {
        const s = localStorage.getItem('userInfo');
        return s ? JSON.parse(s) : null;
    })();

    const authHeaders = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userToken?.token}`,
    };

    // ── Master codes (for Change dropdown) ──
    const [masterCodes, setMasterCodes] = useState([]);   // [{ CODES, DEPT, SUB_CODES, POSITION, ... }]
    const [codesLoading, setCodesLoading] = useState(false);

    const fetchMasterCodes = async () => {
        setCodesLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}master-data-udyan`, {
                headers: authHeaders,
            });
            // Deduplicate by CODES – keep unique group codes with their DEPT
            const rawData = res.data.data || [];
            const seen = new Map();
            rawData.forEach(r => {
                if (!seen.has(r.CODES)) {
                    seen.set(r.CODES, { CODES: r.CODES, DEPT: r.DEPT });
                }
            });
            setMasterCodes([...seen.values()].sort((a, b) => a.CODES.localeCompare(b.CODES)));
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load master codes.', confirmButtonColor: '#1d4ed8' });
        } finally {
            setCodesLoading(false);
        }
    };

    useEffect(() => {
        fetchMasterCodes();
    }, []);

    // ═══════════════════════════════════════════════
    //  CREATION
    // ═══════════════════════════════════════════════
    const [createRows, setCreateRows] = useState([{ ...EMPTY_CREATE_ROW }]);
    const [createErrors, setCreateErrors] = useState([{}]);
    const [createLoading, setCreateLoading] = useState(false);

    const addCreateRow = () => {
        setCreateRows(r => [...r, { ...EMPTY_CREATE_ROW }]);
        setCreateErrors(e => [...e, {}]);
    };

    const removeCreateRow = (i) => {
        if (createRows.length === 1) return;
        setCreateRows(r => r.filter((_, idx) => idx !== i));
        setCreateErrors(e => e.filter((_, idx) => idx !== i));
    };

    const updateCreateRow = (i, field, value) => {
        // Auto-uppercase the code field
        const finalValue = field === 'code' ? value.toUpperCase() : value;
        setCreateRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: finalValue } : row));

        // Live validation for code field
        if (field === 'code') {
            const err = finalValue && !CODE_REGEX.test(finalValue)
                ? 'Format: 2 letters + 2 digits (e.g. AB01)'
                : '';
            setCreateErrors(e => e.map((errObj, idx) => idx === i ? { ...errObj, code: err } : errObj));
        }
    };

    const handleCreate = async () => {
        // Validate all rows
        let hasError = false;
        const newErrors = createRows.map(r => {
            const errs = {};
            if (!r.code.trim()) { errs.code = 'Code is required'; hasError = true; }
            else if (!CODE_REGEX.test(r.code.trim())) { errs.code = 'Format: 2 letters + 2 digits (e.g. AB01)'; hasError = true; }
            if (!r.dept.trim()) { errs.dept = 'Description is required'; hasError = true; }
            return errs;
        });
        setCreateErrors(newErrors);

        if (hasError) {
            Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please fix all highlighted fields before submitting.', confirmButtonColor: '#1d4ed8' });
            return;
        }

        setCreateLoading(true);
        try {
            const payload = {
                rows: createRows.map(r => ({ CODES: r.code.trim(), DEPT: r.dept.trim() })),
            };
            const res = await axios.post(`${API_BASE_URL}group-code/create`, payload, { headers: authHeaders });

            if (res.data.status === 201 || res.data.success) {
                Swal.fire({ icon: 'success', title: 'Created!', text: res.data.message || `${createRows.length} group code(s) created successfully.`, confirmButtonColor: '#1d4ed8' });
                setCreateRows([{ ...EMPTY_CREATE_ROW }]);
                setCreateErrors([{}]);
                fetchMasterCodes();
            } else {
                Swal.fire({ icon: 'error', title: 'Failed', text: res.data.message || 'Something went wrong.', confirmButtonColor: '#1d4ed8' });
            }
        } catch (err) {
            const status = err.response?.status;
            const msg = err.response?.data?.message || '';

            if (status === 422 && msg.toLowerCase().includes('already exists')) {
                // Extract the duplicate code from the message e.g. "Code AB01 already exists..."
                const match = msg.match(/Code\s+([A-Z0-9]+)\s+already exists/i);
                const dupCode = match ? match[1].toUpperCase() : null;

                if (dupCode) {
                    // Highlight the specific row(s) that have this duplicate code
                    setCreateErrors(prev =>
                        prev.map((errObj, idx) =>
                            createRows[idx]?.code?.toUpperCase() === dupCode
                                ? { ...errObj, code: `Code "${dupCode}" already exists in master data` }
                                : errObj
                        )
                    );
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Duplicate Code',
                    html: `<div style="font-size:14px">Code <strong style="color:#dc2626;font-family:monospace;font-size:15px">${dupCode || ''}</strong> already exists in the master data.<br/><br/>Please use a different code.</div>`,
                    confirmButtonColor: '#1d4ed8',
                    confirmButtonText: 'OK, I\'ll change it',
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: msg || 'Server error. Please try again.', confirmButtonColor: '#1d4ed8' });
            }
        } finally {
            setCreateLoading(false);
        }
    };

    // ═══════════════════════════════════════════════
    //  CHANGE
    // ═══════════════════════════════════════════════
    const [changeRows, setChangeRows] = useState([{ ...EMPTY_CHANGE_ROW }]);
    const [changeErrors, setChangeErrors] = useState([{}]);
    const [changeLoading, setChangeLoading] = useState(false);

    const addChangeRow = () => {
        setChangeRows(r => [...r, { ...EMPTY_CHANGE_ROW }]);
        setChangeErrors(e => [...e, {}]);
    };

    const removeChangeRow = (i) => {
        if (changeRows.length === 1) return;
        setChangeRows(r => r.filter((_, idx) => idx !== i));
        setChangeErrors(e => e.filter((_, idx) => idx !== i));
    };

    const updateChangeCode = (i, selectedCode) => {
        // Auto-fill department from masterCodes
        const master = masterCodes.find(m => m.CODES === selectedCode);
        const dept = master ? master.DEPT : '';
        setChangeRows(r => r.map((row, idx) => idx === i ? { code: selectedCode, dept } : row));
        setChangeErrors(e => e.map((errObj, idx) => idx === i ? { ...errObj, code: '' } : errObj));
    };

    const updateChangeDept = (i, value) => {
        setChangeRows(r => r.map((row, idx) => idx === i ? { ...row, dept: value } : row));
        if (value.trim()) {
            setChangeErrors(e => e.map((errObj, idx) => idx === i ? { ...errObj, dept: '' } : errObj));
        }
    };

    const handleChange = async () => {
    let hasError = false;
    const newErrors = changeRows.map(r => {
        const errs = {};
        if (!r.code) { errs.code = 'Please select a code'; hasError = true; }
        if (!r.dept.trim()) { errs.dept = 'Description is required'; hasError = true; }
        return errs;
    });

    // ── NEW: Detect duplicate codes within the submitted rows ──
    const codeCounts = {};
    changeRows.forEach((r, idx) => {
        const code = r.code;
        if (code) {
            if (!codeCounts[code]) codeCounts[code] = [];
            codeCounts[code].push(idx);
        }
    });

    Object.entries(codeCounts).forEach(([code, indices]) => {
        if (indices.length > 1) {
            hasError = true;
            indices.forEach(idx => {
                newErrors[idx] = {
                    ...newErrors[idx],
                    code: `Duplicate code "${code}" — each code must be unique`,
                };
            });
        }
    });
    // ── END duplicate check ──

    setChangeErrors(newErrors);

    if (hasError) {
        Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please fix all highlighted fields before submitting.', confirmButtonColor: '#0f766e' });
        return;
    }

        setChangeLoading(true);
        try {
            const payload = {
                rows: changeRows.map(r => ({ CODES: r.code, DEPT: r.dept.trim() })),
            };
            const res = await axios.post(`${API_BASE_URL}group-code/update`, payload, { headers: authHeaders });

            if (res.data.status === 200 || res.data.success) {
                Swal.fire({ icon: 'success', title: 'Updated!', text: res.data.message || `${changeRows.length} group code(s) updated successfully.`, confirmButtonColor: '#0f766e' });
                setChangeRows([{ ...EMPTY_CHANGE_ROW }]);
                setChangeErrors([{}]);
                fetchMasterCodes(); // refresh dropdown
            } else {
                Swal.fire({ icon: 'error', title: 'Failed', text: res.data.message || 'Something went wrong.', confirmButtonColor: '#0f766e' });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Server error. Please try again.';
            Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#0f766e' });
        } finally {
            setChangeLoading(false);
        }
    };

    // ═══════════════════════════════════════════════
    //  STYLES
    // ═══════════════════════════════════════════════
    const isChange = activeTab === 'change';

    const inputBase = (hasErr) =>
        `w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 bg-white transition placeholder-slate-400 ${hasErr
            ? 'border-red-400 focus:ring-red-300 bg-red-50'
            : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'
        }`;

    const inputTeal = (hasErr) =>
        `w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 bg-white transition placeholder-slate-400 ${hasErr
            ? 'border-red-400 focus:ring-red-300 bg-red-50'
            : 'border-slate-300 focus:ring-teal-500 focus:border-transparent'
        }`;

    const selectBase = (hasErr, isTeal = false) =>
        `w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 bg-white transition cursor-pointer ${hasErr
            ? 'border-red-400 focus:ring-red-300 bg-red-50'
            : isTeal
                ? 'border-slate-300 focus:ring-teal-500 focus:border-transparent'
                : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'
        }`;

    return (
        <div className="w-full max-w-2xl mx-auto mt-20 overflow-hidden bg-white border border-blue-100 shadow-xl rounded-2xl">

            {/* ── Header ── */}
            <div className={`px-6 py-4 flex items-center justify-between transition-all duration-300 ${isChange
                ? 'bg-gradient-to-r from-teal-800 to-teal-600'
                : 'bg-gradient-to-r from-blue-800 to-blue-600'
                }`}>
                <div className="flex items-center gap-3">
                    <img src="./mrflogo.png" alt="Logo" className="object-contain w-12 p-1 bg-white rounded-md h-9" />
                    <div>
                        <h1 className="text-base font-extrabold leading-tight tracking-wide text-white">Group Code</h1>
                        <p className={`text-xs font-medium transition-all duration-300 ${isChange ? 'text-teal-200' : 'text-blue-200'}`}>
                            Creation / Change
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/MasterDataUdyan')}
                    className="transition-colors text-white/80 hover:text-white"
                    title="Go Back"
                >
                    <ArrowBackIcon fontSize="medium" />
                </button>
            </div>

            <div className="px-6 pt-5 pb-6">

                {/* ── Tabs ── */}
                <div className="flex justify-center mb-5">
                    <div className="flex overflow-hidden border shadow-sm rounded-xl border-slate-200">
                        <button
                            onClick={() => setActiveTab('creation')}
                            className={`px-8 py-2 text-sm font-semibold transition-all duration-200 ${activeTab === 'creation'
                                ? 'bg-blue-700 text-white shadow-inner'
                                : 'bg-white text-blue-700 hover:bg-blue-50'
                                }`}
                        >
                            ➕ Creation
                        </button>
                        <button
                            onClick={() => setActiveTab('change')}
                            className={`px-8 py-2 text-sm font-semibold border-l border-slate-200 transition-all duration-200 ${activeTab === 'change'
                                ? 'bg-teal-600 text-white shadow-inner'
                                : 'bg-white text-teal-700 hover:bg-teal-50'
                                }`}
                        >
                            ✏️ Change
                        </button>
                    </div>
                </div>

                {/* ════════ CREATION TABLE ════════ */}
                {activeTab === 'creation' && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="inline-block w-1 h-4 bg-blue-600 rounded-full"></span>
                                New Group Code Creation
                            </h2>
                            <button
                                onClick={addCreateRow}
                                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                            >
                                <AddIcon fontSize="small" /> Add Row
                            </button>
                        </div>

                        {/* Format hint */}
                        <div className="flex items-center gap-2 px-3 py-2 mb-3 border border-blue-100 rounded-lg bg-blue-50">
                            <span className="text-xs text-blue-500">ℹ️</span>
                            <span className="text-xs font-medium text-blue-700">
                                Code format: <strong>2 letters + 2 digits</strong>
                            </span>
                        </div>

                        <div className="overflow-hidden border shadow-sm rounded-xl border-slate-200">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-white bg-blue-700">
                                        <th className="py-2.5 px-3 text-center font-bold w-12">S.No</th>
                                        <th className="py-2.5 px-3 text-left font-bold">
                                            Code
                                            <span className="ml-1 font-normal text-blue-200">(e.g. AB01)</span>
                                        </th>
                                        <th className="py-2.5 px-3 text-left font-bold">Description</th>
                                        <th className="py-2.5 px-3 text-center font-bold w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {createRows.map((row, i) => (
                                        <tr
                                            key={i}
                                            className={`${i % 2 === 0 ? 'bg-blue-50/40' : 'bg-white'} border-t border-slate-100 hover:bg-blue-50 transition-colors`}
                                        >
                                            <td className="px-3 py-2 font-medium text-center text-slate-500">{i + 1}</td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. AB01"
                                                    maxLength={4}
                                                    value={row.code}
                                                    onChange={(e) => updateCreateRow(i, 'code', e.target.value)}
                                                    className={inputBase(!!createErrors[i]?.code)}
                                                />
                                                {createErrors[i]?.code && (
                                                    <p className="text-red-500 text-[10px] mt-0.5 pl-0.5">{createErrors[i].code}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter description / department"
                                                    value={row.dept}
                                                    onChange={(e) => updateCreateRow(i, 'dept', e.target.value)}
                                                    className={inputBase(!!createErrors[i]?.dept)}
                                                />
                                                {createErrors[i]?.dept && (
                                                    <p className="text-red-500 text-[10px] mt-0.5 pl-0.5">{createErrors[i].dept}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    onClick={() => removeCreateRow(i)}
                                                    disabled={createRows.length === 1}
                                                    className="text-red-400 transition hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Remove row"
                                                >
                                                    <DeleteOutlineIcon fontSize="small" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleCreate}
                                disabled={createLoading}
                                className="px-7 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {createLoading ? (
                                    <>
                                        <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Creating…
                                    </>
                                ) : '✅ Create'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ════════ CHANGE TABLE ════════ */}
                {activeTab === 'change' && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="inline-block w-1 h-4 bg-teal-500 rounded-full"></span>
                                Modify Existing Group Codes
                            </h2>
                            <button
                                onClick={addChangeRow}
                                className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
                            >
                                <AddIcon fontSize="small" /> Add Row
                            </button>
                        </div>

                        {/* Hint */}
                        <div className="flex items-center gap-2 px-3 py-2 mb-3 border border-teal-100 rounded-lg bg-teal-50">
                            <span className="text-xs text-teal-500">ℹ️</span>
                            <span className="text-xs font-medium text-teal-700">
                                Select a code from the dropdown — the current description will auto-fill and can be edited.
                            </span>
                        </div>

                        {codesLoading && (
                            <div className="flex items-center justify-center gap-2 py-4 text-xs font-medium text-teal-600">
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Loading codes…
                            </div>
                        )}

                        {!codesLoading && (
                            <>
                                <div className="overflow-hidden border shadow-sm rounded-xl border-slate-200">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-white bg-teal-600">
                                                <th className="py-2.5 px-3 text-center font-bold w-12">S.No</th>
                                                <th className="py-2.5 px-3 text-left font-bold">Select Code</th>
                                                <th className="py-2.5 px-3 text-left font-bold">Description (Editable)</th>
                                                <th className="py-2.5 px-3 text-center font-bold w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {changeRows.map((row, i) => (
                                                <tr
                                                    key={i}
                                                    className={`${i % 2 === 0 ? 'bg-teal-50/40' : 'bg-white'} border-t border-slate-100 hover:bg-teal-50 transition-colors`}
                                                >
                                                    <td className="px-3 py-2 font-medium text-center text-slate-500">{i + 1}</td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.code}
                                                            onChange={(e) => updateChangeCode(i, e.target.value)}
                                                            className={selectBase(!!changeErrors[i]?.code, true)}
                                                        >
                                                            <option value="">— Select Code —</option>
                                                            {masterCodes.map(m => (
                                                                <option key={m.CODES} value={m.CODES}>{m.CODES}</option>
                                                            ))}
                                                        </select>
                                                        {changeErrors[i]?.code && (
                                                            <p className="text-red-500 text-[10px] mt-0.5 pl-0.5">{changeErrors[i].code}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            placeholder={row.code ? 'Edit description…' : 'Select a code first'}
                                                            value={row.dept}
                                                            disabled={!row.code}
                                                            onChange={(e) => updateChangeDept(i, e.target.value)}
                                                            className={`${inputTeal(!!changeErrors[i]?.dept)} ${!row.code ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        />
                                                        {changeErrors[i]?.dept && (
                                                            <p className="text-red-500 text-[10px] mt-0.5 pl-0.5">{changeErrors[i].dept}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <button
                                                            onClick={() => removeChangeRow(i)}
                                                            disabled={changeRows.length === 1}
                                                            className="text-red-400 transition hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title="Remove row"
                                                        >
                                                            <DeleteOutlineIcon fontSize="small" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-center mt-4">
                                    <button
                                        onClick={handleChange}
                                        disabled={changeLoading}
                                        className="px-7 py-2.5 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {changeLoading ? (
                                            <>
                                                <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Updating…
                                            </>
                                        ) : '✏️ Change'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupCode;