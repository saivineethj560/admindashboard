import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL } from "../Config";


const getAuthHeaders = () => {
    const userInfo = localStorage.getItem('userInfo');
    const token = userInfo ? JSON.parse(userInfo)?.token : null;
    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

const EMPTY_CREATE_ROW = { code: '', dept: '', subcode: '', position: '' };
const EMPTY_CHANGE_ROW = { code: '', dept: '', subcode: '', position: '' };
const EMPTY_CREATE_ERR = { code: '', subcode: '', position: '' };
const EMPTY_CHANGE_ERR = { code: '', subcode: '', position: '' };

const nextSubCode = (last) => {
    if (!last) return '';
    const match = last.match(/^([A-Za-z]*)(\d+)$/);
    if (!match) return '';
    const prefix = match[1];
    const num = parseInt(match[2], 10) + 1;
    const padded = String(num).padStart(match[2].length, '0');
    return `${prefix}${padded}`;
};

// NEW: Generate default subcode for a new group code (e.g., AB01 → AB0010)
const getDefaultSubCode = (code) => {
    if (!code) return '';
    // Assumes group code format: 2 letters + 2 digits (e.g., AB01)
    const prefix = code.slice(0, 2);
    return prefix + '0010';
};

const SubCode = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('creation');

    const [masterData, setMasterData] = useState([]);
    const [masterCodes, setMasterCodes] = useState([]);
    const [codesLoading, setCodesLoading] = useState(false);

    const [createRows, setCreateRows] = useState([{ ...EMPTY_CREATE_ROW }]);
    const [createErrors, setCreateErrors] = useState([{ ...EMPTY_CREATE_ERR }]);

    const [changeRows, setChangeRows] = useState([{ ...EMPTY_CHANGE_ROW }]);
    const [changeErrors, setChangeErrors] = useState([{ ...EMPTY_CHANGE_ERR }]);

    useEffect(() => {
        fetchMasterCodes();
    }, []);

    const fetchMasterCodes = async () => {
        setCodesLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}master-data-udyan`, {
                headers: getAuthHeaders(),
            });
            const rawData = res.data.data || [];
            const seen = new Map();
            rawData.forEach((r) => {
                if (!seen.has(r.CODES)) seen.set(r.CODES, { CODES: r.CODES, DEPT: r.DEPT });
            });
            setMasterData(rawData);
            setMasterCodes([...seen.values()].sort((a, b) => a.CODES.localeCompare(b.CODES)));
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load master codes.', confirmButtonColor: '#1d4ed8' });
        } finally {
            setCodesLoading(false);
        }
    };

    const getSubCodesForCode = (code) => {
        const rows = masterData.filter((r) => r.CODES === code);
        const seen = new Set();
        return rows
            .filter((r) => { if (seen.has(r.SUB_CODES)) return false; seen.add(r.SUB_CODES); return true; })
            .map((r) => r.SUB_CODES)
            .sort();
    };

    const getPositionForCombination = (code, subcode) => {
        const match = masterData.find((r) => r.CODES === code && r.SUB_CODES === subcode);
        return match ? match.POSITION : '';
    };

    // MODIFIED: Returns default if no subcodes exist for the given code
    const getNextSubCode = (code) => {
        const subcodes = getSubCodesForCode(code);
        if (subcodes.length === 0) {
            return getDefaultSubCode(code);
        }
        return nextSubCode(subcodes[subcodes.length - 1]);
    };

    // ── Clear a specific error field when the user fills it in ──
    const clearCreateError = (i, field) => {
        setCreateErrors((errs) =>
            errs.map((e, idx) => idx === i ? { ...e, [field]: '' } : e)
        );
    };

    const clearChangeError = (i, field) => {
        setChangeErrors((errs) =>
            errs.map((e, idx) => idx === i ? { ...e, [field]: '' } : e)
        );
    };

    // ═══════════════════════════════
    //  CREATION helpers
    // ═══════════════════════════════
    const addCreateRow = () => {
        setCreateRows((rows) => {
            const lastRow = rows[rows.length - 1];
            let nextSub = '';

            if (lastRow?.code) {
                nextSub = lastRow.subcode ? nextSubCode(lastRow.subcode) : getNextSubCode(lastRow.code);
            }

            return [...rows, { ...EMPTY_CREATE_ROW, code: lastRow?.code || '', dept: lastRow?.dept || '', subcode: nextSub }];
        });
        setCreateErrors((e) => [...e, { ...EMPTY_CREATE_ERR }]);
    };

    const removeCreateRow = (i) => {
        if (createRows.length === 1) return;

        setCreateRows((rows) => {
            const newRows = rows.filter((_, idx) => idx !== i);
            const deletedCode = rows[i].code;
            if (!deletedCode) return newRows;

            const existingSubCodes = getSubCodesForCode(deletedCode);
            let lastSubCode = existingSubCodes.length > 0
                ? existingSubCodes[existingSubCodes.length - 1]
                : null;   // null means no saved subcodes exist

            return newRows.map((row) => {
                if (row.code !== deletedCode) return row;
                let next;
                if (lastSubCode === null) {
                    next = getDefaultSubCode(deletedCode);
                } else {
                    next = nextSubCode(lastSubCode);
                }
                lastSubCode = next;
                return { ...row, subcode: next };
            });
        });

        setCreateErrors((e) => e.length === 1 ? e : e.filter((_, idx) => idx !== i));
    };

    const updateCreateRow = (i, field, value) => {
        setCreateRows((rows) => {
            const updated = rows.map((row, idx) => {
                if (idx !== i) return row;
                const newRow = { ...row, [field]: value };
                if (field === 'code') {
                    const codeObj = masterCodes.find((c) => c.CODES === value);
                    newRow.dept = codeObj ? codeObj.DEPT : '';
                    newRow.subcode = getNextSubCode(value);
                    newRow.position = '';
                }
                return newRow;
            });

            // After changing a code, resequence all rows with the same code
            if (field === 'code') {
                const existingSubCodes = getSubCodesForCode(value);
                let lastSubCode = existingSubCodes.length > 0
                    ? existingSubCodes[existingSubCodes.length - 1]
                    : null;   // null means no saved subcodes exist

                return updated.map((row) => {
                    if (row.code !== value) return row;
                    let next;
                    if (lastSubCode === null) {
                        next = getDefaultSubCode(value);
                    } else {
                        next = nextSubCode(lastSubCode);
                    }
                    lastSubCode = next;
                    return { ...row, subcode: next };
                });
            }

            return updated;
        });

        if (field !== 'dept') clearCreateError(i, field);
    };

    const validateCreateRows = () => {
        let hasError = false;
        const newErrors = createRows.map((r) => {
            const err = { code: '', subcode: '', position: '' };
            if (!r.code.trim()) { err.code = 'Group Code is required.'; hasError = true; }
            if (!r.subcode.trim()) { err.subcode = 'Sub Code is required.'; hasError = true; }
            if (!r.position.trim()) { err.position = 'Position is required.'; hasError = true; }
            return err;
        });
        setCreateErrors(newErrors);
        return !hasError;
    };

    const handleCreate = async () => {
        if (!validateCreateRows()) return;

        try {
            const payload = createRows.map((r) => ({
                CODES: r.code,
                SUB_CODES: r.subcode,
                DEPT: r.dept,
                POSITION: r.position,
            }));

            await axios.post(
                `${API_BASE_URL}master-data/create`,
                { data: payload },
                { headers: getAuthHeaders() }
            );

            Swal.fire({ icon: 'success', title: 'Created!', text: `${createRows.length} sub code(s) created successfully.`, confirmButtonColor: '#1d4ed8' });
            setCreateRows([{ ...EMPTY_CREATE_ROW }]);
            setCreateErrors([{ ...EMPTY_CREATE_ERR }]);
            fetchMasterCodes();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Failed to create sub codes.', confirmButtonColor: '#1d4ed8' });
        }
    };

    // ═══════════════════════════════
    //  CHANGE helpers
    // ═══════════════════════════════
    const addChangeRow = () => {
        setChangeRows((r) => [...r, { ...EMPTY_CHANGE_ROW }]);
        setChangeErrors((e) => [...e, { ...EMPTY_CHANGE_ERR }]);
    };

    const removeChangeRow = (i) => {
        setChangeRows((r) => r.length === 1 ? r : r.filter((_, idx) => idx !== i));
        setChangeErrors((e) => e.length === 1 ? e : e.filter((_, idx) => idx !== i));
    };

    const updateChangeRow = (i, field, value) => {
        setChangeRows((rows) =>
            rows.map((row, idx) => {
                if (idx !== i) return row;
                const updated = { ...row, [field]: value };
                if (field === 'code') {
                    const codeObj = masterCodes.find((c) => c.CODES === value);
                    updated.dept = codeObj ? codeObj.DEPT : '';
                    updated.subcode = '';
                    updated.position = '';
                }
                if (field === 'subcode') {
                    updated.position = getPositionForCombination(row.code, value);
                }
                return updated;
            })
        );
        if (field !== 'dept') clearChangeError(i, field);
    };

    const validateChangeRows = () => {
        let hasError = false;
        const newErrors = changeRows.map((r) => {
            const err = { code: '', subcode: '', position: '' };
            if (!r.code.trim()) { err.code = 'Group Code is required.'; hasError = true; }
            if (!r.subcode.trim()) { err.subcode = 'Sub Code is required.'; hasError = true; }
            if (!r.position.trim()) { err.position = 'Position is required.'; hasError = true; }
            return err;
        });
        setChangeErrors(newErrors);
        return !hasError;
    };

    const handleChange = async () => {
        if (!validateChangeRows()) return;

        try {
            const payload = changeRows.map((r) => ({
                CODES: r.code,
                SUB_CODES: r.subcode,
                DEPT: r.dept,
                POSITION: r.position,
            }));

            await axios.put(
                `${API_BASE_URL}master-data/update`,
                { data: payload },
                { headers: getAuthHeaders() }
            );

            Swal.fire({ icon: 'success', title: 'Updated!', text: `${changeRows.length} sub code(s) updated successfully.`, confirmButtonColor: '#0f766e' });
            setChangeRows([{ ...EMPTY_CHANGE_ROW }]);
            setChangeErrors([{ ...EMPTY_CHANGE_ERR }]);
            fetchMasterCodes();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Failed to update sub codes.', confirmButtonColor: '#0f766e' });
        }
    };

    // ── Styles ──
    const inp = (hasErr) => `w-full px-2 py-1.5 border rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:border-transparent bg-white transition placeholder-slate-400 ${hasErr ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'}`;
    const inpTeal = (hasErr) => `w-full px-2 py-1.5 border rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:border-transparent bg-white transition placeholder-slate-400 ${hasErr ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-teal-500'}`;
    const sel = (hasErr) => `${inp(hasErr)} cursor-pointer`;
    const selTeal = (hasErr) => `${inpTeal(hasErr)} cursor-pointer`;
    const readOnly = 'w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-400 bg-slate-50 cursor-not-allowed select-none';

    // ── Inline error message ──
    const ErrMsg = ({ msg }) =>
        msg ? <p className="mt-1 text-[10px] text-red-500 font-medium flex items-center gap-0.5"><span>⚠</span>{msg}</p> : null;

    const isChange = activeTab === 'change';

    return (
        <div className="w-full max-w-5xl mx-auto mt-20 overflow-hidden bg-white border border-blue-100 shadow-xl rounded-2xl">

            {/* ── Header ── */}
            <div className={`px-6 py-4 flex items-center justify-between transition-all duration-300 ${isChange
                ? 'bg-gradient-to-r from-teal-800 to-teal-600'
                : 'bg-gradient-to-r from-blue-800 to-blue-600'}`}>
                <div className="flex items-center gap-3">
                    <img src="./mrflogo.png" alt="Logo" className="object-contain w-12 p-1 bg-white rounded-md h-9" />
                    <div>
                        <h1 className="text-base font-extrabold leading-tight tracking-wide text-white">Sub Code</h1>
                        <p className={`text-xs font-medium transition-all duration-300 ${isChange ? 'text-teal-200' : 'text-blue-200'}`}>
                            Creation / Change
                        </p>
                    </div>
                </div>
                <button onClick={() => navigate('/MasterDataUdyan')} className="transition-colors text-white/80 hover:text-white" title="Go Back">
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
                                : 'bg-white text-blue-700 hover:bg-blue-50'}`}
                        >
                            ➕ Creation
                        </button>
                        <button
                            onClick={() => setActiveTab('change')}
                            className={`px-8 py-2 text-sm font-semibold border-l border-slate-200 transition-all duration-200 ${activeTab === 'change'
                                ? 'bg-teal-600 text-white shadow-inner'
                                : 'bg-white text-teal-700 hover:bg-teal-50'}`}
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
                                New Sub Code Creation
                            </h2>
                            <button
                                onClick={addCreateRow}
                                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                            >
                                <AddIcon fontSize="small" /> Add Row
                            </button>
                        </div>

                        <div className="overflow-hidden border shadow-sm rounded-xl border-slate-200">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-white bg-blue-700">
                                        <th className="py-2.5 px-2 text-center font-bold w-10">S.No</th>
                                        <th className="py-2.5 px-2 text-left font-bold">Group Code</th>
                                        <th className="py-2.5 px-2 text-left font-bold">Department</th>
                                        <th className="py-2.5 px-2 text-left font-bold">Sub Code</th>
                                        <th className="py-2.5 px-2 text-left font-bold">Position</th>
                                        <th className="py-2.5 px-2 text-center font-bold w-8"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {createRows.map((row, i) => {
                                        const err = createErrors[i] || EMPTY_CREATE_ERR;
                                        return (
                                            <tr key={i} className={`${i % 2 === 0 ? 'bg-blue-50/40' : 'bg-white'} border-t border-slate-100 hover:bg-blue-50 transition-colors`}>
                                                <td className="px-2 py-2 pt-3 font-medium text-center align-top text-slate-500">{i + 1}</td>

                                                {/* Group Code */}
                                                <td className="px-2 py-2 align-top">
                                                    <select
                                                        value={row.code}
                                                        onChange={(e) => updateCreateRow(i, 'code', e.target.value)}
                                                        className={sel(!!err.code)}
                                                        disabled={codesLoading}
                                                    >
                                                        <option value="">{codesLoading ? 'Loading...' : '— Select Code —'}</option>
                                                        {masterCodes.map((c) => (
                                                            <option key={c.CODES} value={c.CODES}>{c.CODES}</option>
                                                        ))}
                                                    </select>
                                                    <ErrMsg msg={err.code} />
                                                </td>

                                                {/* Department — auto-filled */}
                                                <td className="px-2 py-2 align-top">
                                                    <input type="text" value={row.dept} readOnly placeholder="Auto-filled" className={readOnly} />
                                                </td>

                                                {/* Sub Code */}
                                                <td className="px-2 py-2 align-top">
                                                    <input
                                                        type="text"
                                                        placeholder={row.code ? 'Auto-generated' : 'Select group code first'}
                                                        value={row.subcode}
                                                        readOnly
                                                        className={readOnly}
                                                    />
                                                    <ErrMsg msg={err.subcode} />
                                                </td>

                                                {/* Position */}
                                                <td className="px-2 py-2 align-top">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter position"
                                                        value={row.position}
                                                        onChange={(e) => updateCreateRow(i, 'position', e.target.value)}
                                                        className={inp(!!err.position)}
                                                    />
                                                    <ErrMsg msg={err.position} />
                                                </td>

                                                <td className="px-2 py-2 pt-2 text-center align-top">
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
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleCreate}
                                className="px-7 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                            >
                                ✅ Create
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
                                Modify Existing Sub Codes
                                <span className="ml-2 text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    Only Position is editable
                                </span>
                            </h2>
                            <button
                                onClick={addChangeRow}
                                className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
                            >
                                <AddIcon fontSize="small" /> Add Row
                            </button>
                        </div>

                        <div className="overflow-hidden border shadow-sm rounded-xl border-slate-200">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-white bg-teal-600">
                                        <th className="py-2.5 px-2 text-center font-bold w-10">S.No</th>
                                        <th className="py-2.5 px-2 text-left font-bold">Group Code</th>
                                        <th className="py-2.5 px-2 text-left font-bold">Department</th>
                                        <th className="py-2.5 px-2 text-left font-bold">Sub Code</th>
                                        <th className="py-2.5 px-2 text-left font-bold">Position</th>
                                        <th className="py-2.5 px-2 text-center font-bold w-8"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {changeRows.map((row, i) => {
                                        const subcodesForCode = row.code ? getSubCodesForCode(row.code) : [];
                                        const err = changeErrors[i] || EMPTY_CHANGE_ERR;
                                        return (
                                            <tr key={i} className={`${i % 2 === 0 ? 'bg-teal-50/40' : 'bg-white'} border-t border-slate-100 hover:bg-teal-50 transition-colors`}>
                                                <td className="px-2 py-2 pt-3 font-medium text-center align-top text-slate-500">{i + 1}</td>

                                                {/* Group Code */}
                                                <td className="px-2 py-2 align-top">
                                                    <select
                                                        value={row.code}
                                                        onChange={(e) => updateChangeRow(i, 'code', e.target.value)}
                                                        className={selTeal(!!err.code)}
                                                        disabled={codesLoading}
                                                    >
                                                        <option value="">{codesLoading ? 'Loading...' : '— Select Code —'}</option>
                                                        {masterCodes.map((c) => (
                                                            <option key={c.CODES} value={c.CODES}>{c.CODES}</option>
                                                        ))}
                                                    </select>
                                                    <ErrMsg msg={err.code} />
                                                </td>

                                                {/* Department — auto-filled */}
                                                <td className="px-2 py-2 align-top">
                                                    <input type="text" value={row.dept} readOnly placeholder="Auto-filled" className={readOnly} />
                                                </td>

                                                {/* Sub Code — dropdown */}
                                                <td className="px-2 py-2 align-top">
                                                    <select
                                                        value={row.subcode}
                                                        onChange={(e) => updateChangeRow(i, 'subcode', e.target.value)}
                                                        disabled={!row.code}
                                                        className={!row.code ? readOnly : selTeal(!!err.subcode)}
                                                    >
                                                        <option value="">— Select Sub Code —</option>
                                                        {subcodesForCode.map((sc) => (
                                                            <option key={sc} value={sc}>{sc}</option>
                                                        ))}
                                                    </select>
                                                    <ErrMsg msg={err.subcode} />
                                                </td>

                                                {/* Position */}
                                                <td className="px-2 py-2 align-top">
                                                    <input
                                                        type="text"
                                                        placeholder={row.subcode ? 'Edit position' : 'Select sub code first'}
                                                        value={row.position}
                                                        onChange={(e) => updateChangeRow(i, 'position', e.target.value)}
                                                        disabled={!row.subcode}
                                                        className={!row.subcode ? readOnly : inpTeal(!!err.position)}
                                                    />
                                                    <ErrMsg msg={err.position} />
                                                </td>

                                                <td className="px-2 py-2 pt-2 text-center align-top">
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
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleChange}
                                className="px-7 py-2.5 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300"
                            >
                                ✏️ Change
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubCode;