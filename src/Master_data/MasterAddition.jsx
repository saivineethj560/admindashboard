import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL } from "../Config";


const EMPTY_ADD_ROW = { groupCode: '', subcode: '', dept: '', position: '', totalPlan: '', add: '', plant: '' };
const EMPTY_SUB_ROW = { groupCode: '', subcode: '', dept: '', position: '', totalPlan: '', sub: '', plant: '' };

const getAuthHeaders = () => {
    const userInfo = localStorage.getItem('userInfo');
    const token = userInfo ? JSON.parse(userInfo)?.token : null;
    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

const MasterAddition = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('add');

    const [masterData, setMasterData] = useState([]);
    const [masterCodes, setMasterCodes] = useState([]);
    const [plants, setPlants] = useState([]);   // ← NEW
    const [codesLoading, setCodesLoading] = useState(false);

    const [addRows, setAddRows] = useState([{ ...EMPTY_ADD_ROW }]);
    const [subRows, setSubRows] = useState([{ ...EMPTY_SUB_ROW }]);
    const [addLoading, setAddLoading] = useState(false);
    const [subLoading, setSubLoading] = useState(false);

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
            setMasterData(rawData);
            setPlants(res.data.plants || []);   // ← NEW

            const seen = new Map();
            rawData.forEach((r) => {
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

    const getSubCodesForCode = (code) => {
        const seen = new Set();
        return masterData
            .filter((r) => r.CODES === code)
            .filter((r) => { if (seen.has(r.SUB_CODES)) return false; seen.add(r.SUB_CODES); return true; })
            .map((r) => r.SUB_CODES)
            .sort();
    };

    const getDetailsForCombo = (code, subcode) => {
        const match = masterData.find((r) => r.CODES === code && r.SUB_CODES === subcode);
        return match
            ? { position: match.POSITION }   // ✅ removed totalPlan — plant not selected yet
            : { position: '' };
    };

    const makeUpdater = (setRows) => (i, field, value) => {
        setRows((rows) =>
            rows.map((row, idx) => {
                if (idx !== i) return row;
                const updated = { ...row, [field]: value };

                if (field === 'groupCode') {
                    const codeObj = masterCodes.find((c) => c.CODES === value);
                    updated.dept = codeObj ? codeObj.DEPT : '';
                    updated.subcode = '';
                    updated.position = '';
                    updated.totalPlan = '';   // ✅ clear on group code change
                    updated.plant = '';
                }

                if (field === 'subcode') {
                    const details = getDetailsForCombo(row.groupCode, value);
                    updated.position = details.position;

                    // ── If plant is already selected, immediately look up totalPlan for it ──
                    if (row.plant) {
                        const match = masterData.find(
                            (r) =>
                                r.CODES === row.groupCode &&
                                r.SUB_CODES === value &&
                                r.PLANT === row.plant
                        );
                        updated.totalPlan = match ? (match.TOTAL_PLAN ?? 0) : 0;
                    } else {
                        updated.totalPlan = '';
                    }
                    // ── Do NOT clear plant — keep whatever plant user already selected ──
                }

                // ── NEW: when plant is selected, look up that plant's specific TOTAL_PLAN ──
                if (field === 'plant') {
                    if (row.groupCode && row.subcode && value) {
                        const match = masterData.find(
                            (r) =>
                                r.CODES === row.groupCode &&
                                r.SUB_CODES === row.subcode &&
                                r.PLANT === value
                        );
                        updated.totalPlan = match ? (match.TOTAL_PLAN ?? 0) : 0;
                    } else {
                        updated.totalPlan = '';   // ✅ no subcode yet, keep empty
                    }
                }

                return updated;
            })
        );
    };

    const updateAddRow = makeUpdater(setAddRows);
    const updateSubRow = makeUpdater(setSubRows);

    const addAddRow = () => setAddRows((r) => [...r, { ...EMPTY_ADD_ROW }]);
    const removeAddRow = (i) => setAddRows((r) => r.length === 1 ? r : r.filter((_, idx) => idx !== i));

    const addSubRow = () => setSubRows((r) => [...r, { ...EMPTY_SUB_ROW }]);
    const removeSubRow = (i) => setSubRows((r) => r.length === 1 ? r : r.filter((_, idx) => idx !== i));

    // ✅ Improved validation for ADD (allows totalPlan to be 0)
    const validateAddRows = () => {
        for (let i = 0; i < addRows.length; i++) {
            const r = addRows[i];
            if (!r.groupCode || r.groupCode.trim() === '') {
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Group Code is required.', confirmButtonColor: '#1d4ed8' });
                return false;
            }
            if (!r.subcode || r.subcode.trim() === '') {
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Sub Code is required.', confirmButtonColor: '#1d4ed8' });
                return false;
            }
            if (!r.dept || r.dept.trim() === '') {
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Department could not be determined.', confirmButtonColor: '#1d4ed8' });
                return false;
            }
            if (!r.position || r.position.trim() === '') {
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Position could not be determined.', confirmButtonColor: '#1d4ed8' });
                return false;
            }
            if (!r.plant || r.plant.trim() === '') {   // ← NEW
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Plant is required.', confirmButtonColor: '#1d4ed8' });
                return false;
            }
            if (r.totalPlan === '' || r.totalPlan === null || r.totalPlan === undefined) {
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Total Plan is missing. Please re-select Sub Code.', confirmButtonColor: '#1d4ed8' });
                return false;
            }
            const addVal = parseInt(r.add);
            if (isNaN(addVal) || addVal < 1) {
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Please enter a valid positive number in the Add field.', confirmButtonColor: '#1d4ed8' });
                return false;
            }
        }
        return true;
    };

    // ✅ Improved validation for SUB (allows totalPlan to be 0)
    const validateSubRows = () => {
        for (let i = 0; i < subRows.length; i++) {
            const r = subRows[i];
            if (!r.groupCode || r.groupCode.trim() === '') {
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Group Code is required.', confirmButtonColor: '#7c3aed' });
                return false;
            }
            if (!r.subcode || r.subcode.trim() === '') {
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Sub Code is required.', confirmButtonColor: '#7c3aed' });
                return false;
            }
            if (!r.dept || r.dept.trim() === '') {
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Department could not be determined.', confirmButtonColor: '#7c3aed' });
                return false;
            }
            if (!r.position || r.position.trim() === '') {
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Position could not be determined.', confirmButtonColor: '#7c3aed' });
                return false;
            }
            if (!r.plant || r.plant.trim() === '') {   // ← NEW
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Plant is required.', confirmButtonColor: '#7c3aed' });
                return false;
            }
            if (r.totalPlan === '' || r.totalPlan === null || r.totalPlan === undefined) {
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Total Plan is missing.', confirmButtonColor: '#7c3aed' });
                return false;
            }
            const subVal = parseInt(r.sub);
            if (isNaN(subVal) || subVal < 1) {
                Swal.fire({ icon: 'warning', title: `Row ${i + 1}`, text: 'Please enter a valid positive number in the Sub field.', confirmButtonColor: '#7c3aed' });
                return false;
            }
        }
        return true;
    };

    const handleAdd = async () => {
        if (!validateAddRows()) return;
        setAddLoading(true);
        try {
            const payload = {
                operation: 'ADD',
                rows: addRows.map((r) => ({
                    CODES: r.groupCode,
                    SUB_CODES: r.subcode,
                    DEPT: r.dept,
                    POSITION: r.position,
                    TOTAL_PLAN: parseInt(r.totalPlan),
                    AMOUNT: parseInt(r.add),
                    PLANT: r.plant,   // ← NEW
                })),
            };

            const res = await axios.post(`${API_BASE_URL}manpower/add-sub`, payload, {
                headers: getAuthHeaders(),
            });

            Swal.fire({ icon: 'success', title: 'Added!', text: res.data.message || `${addRows.length} record(s) added successfully.`, confirmButtonColor: '#1d4ed8' });
            setAddRows([{ ...EMPTY_ADD_ROW }]);
            fetchMasterCodes();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Failed to add records.', confirmButtonColor: '#1d4ed8' });
        } finally {
            setAddLoading(false);
        }
    };

    const handleSub = async () => {
        if (!validateSubRows()) return;
        setSubLoading(true);
        try {
            const payload = {
                operation: 'SUB',
                rows: subRows.map((r) => ({
                    CODES: r.groupCode,
                    SUB_CODES: r.subcode,
                    DEPT: r.dept,
                    POSITION: r.position,
                    TOTAL_PLAN: parseInt(r.totalPlan),
                    AMOUNT: parseInt(r.sub),
                    PLANT: r.plant,   // ← NEW
                })),
            };

            const res = await axios.post(`${API_BASE_URL}manpower/add-sub`, payload, {
                headers: getAuthHeaders(),
            });

            Swal.fire({ icon: 'success', title: 'Subtracted!', text: res.data.message || `${subRows.length} record(s) updated successfully.`, confirmButtonColor: '#7c3aed' });
            setSubRows([{ ...EMPTY_SUB_ROW }]);
            fetchMasterCodes();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'Failed to subtract records.', confirmButtonColor: '#7c3aed' });
        } finally {
            setSubLoading(false);
        }
    };

    // Styles (unchanged)
    const inp = 'w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition placeholder-slate-400';
    const inpVio = 'w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white transition placeholder-slate-400';
    const sel = `${inp} cursor-pointer`;
    const selVio = `${inpVio} cursor-pointer`;
    const readOnly = 'w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-400 bg-slate-50 cursor-not-allowed select-none';

    const isAdd = activeTab === 'add';

    const renderRow = (row, i, updateFn, removeFn, rowsLen, lastField, lastLabel, isAddTab) => {
        const subcodesForCode = row.groupCode ? getSubCodesForCode(row.groupCode) : [];
        const inputCls = isAddTab ? inp : inpVio;
        const selectCls = isAddTab ? sel : selVio;

        return (
            <tr key={i} className={`${i % 2 === 0 ? (isAddTab ? 'bg-blue-50/40' : 'bg-violet-50/40') : 'bg-white'} border-t border-slate-100 ${isAddTab ? 'hover:bg-blue-50' : 'hover:bg-violet-50'} transition-colors`}>
                <td className="px-2 py-2 text-xs font-medium text-center text-slate-500">{i + 1}</td>

                {/* Group Code */}
                <td className="px-2 py-2">
                    <select
                        value={row.groupCode}
                        onChange={(e) => updateFn(i, 'groupCode', e.target.value)}
                        className={selectCls}
                        disabled={codesLoading}
                    >
                        <option value="">{codesLoading ? 'Loading...' : '— Select —'}</option>
                        {masterCodes.map((c) => (
                            <option key={c.CODES} value={c.CODES}>{c.CODES}</option>
                        ))}
                    </select>
                </td>

                {/* Department */}
                <td className="px-2 py-2">
                    <input type="text" value={row.dept} readOnly placeholder="Auto-filled" className={readOnly} />
                </td>

                {/* Sub Code — narrower */}
                <td className="w-24 px-2 py-2">
                    <select
                        value={row.subcode}
                        onChange={(e) => updateFn(i, 'subcode', e.target.value)}
                        disabled={!row.groupCode}
                        className={!row.groupCode ? readOnly : selectCls}
                    >
                        <option value="">— Select Sub Code —</option>
                        {subcodesForCode.map((sc) => (
                            <option key={sc} value={sc}>{sc}</option>
                        ))}
                    </select>
                </td>

                {/* Position */}
                <td className="px-2 py-2">
                    <input type="text" value={row.position} readOnly placeholder="Auto-filled" className={readOnly} />
                </td>

                {/* ── Plant ── NEW */}
                <td className="w-24 px-2 py-2">
                    <select
                        value={row.plant}
                        onChange={(e) => updateFn(i, 'plant', e.target.value)}
                        className={selectCls}
                    >
                        <option value="">— Plant —</option>
                        {plants.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </td>

                {/* Total Plan — narrower */}
                <td className="w-20 px-2 py-2">
                    <input type="text" value={row.totalPlan} readOnly placeholder="Auto-filled" className={readOnly} />
                </td>

                {/* Add / Sub — narrower */}
                <td className="w-20 px-2 py-2">
                    <input
                        type="number"
                        min="1"
                        placeholder={lastLabel}
                        value={row[lastField]}
                        onChange={(e) => updateFn(i, lastField, e.target.value)}
                        disabled={!row.subcode}
                        className={!row.subcode ? readOnly : inputCls}
                    />
                </td>

                {/* Delete */}
                <td className="px-2 py-2 text-center">
                    <button
                        onClick={() => removeFn(i)}
                        disabled={rowsLen === 1}
                        className="text-red-400 transition hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove row"
                    >
                        <DeleteOutlineIcon fontSize="small" />
                    </button>
                </td>
            </tr>
        );
    };

    const tableHead = (bgClass, lastColLabel) => (
        <thead>
            <tr className={`${bgClass} text-white`}>
                <th className="py-2.5 px-2 text-center font-bold text-xs w-10">S.No</th>
                <th className="py-2.5 px-2 text-left font-bold text-xs">Group Code</th>
                <th className="py-2.5 px-2 text-left font-bold text-xs">Department</th>
                <th className="py-2.5 px-2 text-left font-bold text-xs w-24">Sub Code</th>
                <th className="py-2.5 px-2 text-left font-bold text-xs">Position</th>
                <th className="py-2.5 px-2 text-left font-bold text-xs w-24">Plant</th>        {/* ← NEW */}
                <th className="py-2.5 px-2 text-left font-bold text-xs w-20">Total Plan</th>
                <th className="py-2.5 px-2 text-left font-bold text-xs w-20">{lastColLabel}</th>
                <th className="py-2.5 px-2 text-center font-bold text-xs w-8"></th>
            </tr>
        </thead>
    );

    return (
        <div className="w-full max-w-5xl mx-auto mt-20 overflow-hidden bg-white border border-blue-100 shadow-xl rounded-2xl">
            {/* Header (unchanged) */}
            <div className={`px-6 py-4 flex items-center justify-between transition-all duration-300 ${isAdd
                ? 'bg-gradient-to-r from-blue-800 to-blue-600'
                : 'bg-gradient-to-r from-violet-800 to-violet-600'}`}>
                <div className="flex items-center gap-3">
                    <img src="./mrflogo.png" alt="Logo" className="object-contain w-12 p-1 bg-white rounded-md h-9" />
                    <div>
                        <h1 className="text-base font-extrabold leading-tight tracking-wide text-white">Manpower Addition</h1>
                        <p className={`text-xs font-medium ${isAdd ? 'text-blue-200' : 'text-violet-200'}`}>Add / Sub</p>
                    </div>
                </div>
                <button onClick={() => navigate('/MasterDataUdyan')} className="transition-colors text-white/80 hover:text-white" title="Go Back">
                    <ArrowBackIcon fontSize="medium" />
                </button>
            </div>

            <div className="px-6 pt-5 pb-6">
                {/* Tabs (unchanged) */}
                <div className="flex justify-center mb-5">
                    <div className="flex overflow-hidden border shadow-sm rounded-xl border-slate-200">
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`px-8 py-2 text-sm font-semibold transition-all duration-200 ${activeTab === 'add'
                                ? 'bg-blue-700 text-white shadow-inner'
                                : 'bg-white text-blue-700 hover:bg-blue-50'}`}
                        >
                            ➕ Add
                        </button>
                        <button
                            onClick={() => setActiveTab('sub')}
                            className={`px-8 py-2 text-sm font-semibold border-l border-slate-200 transition-all duration-200 ${activeTab === 'sub'
                                ? 'bg-violet-600 text-white shadow-inner'
                                : 'bg-white text-violet-600 hover:bg-violet-50'}`}
                        >
                            ➖ Sub
                        </button>
                    </div>
                </div>

                {/* ADD TABLE */}
                {activeTab === 'add' && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="inline-block w-1 h-4 bg-blue-600 rounded-full"></span>
                                Add Manpower Records
                            </h2>
                            <button onClick={addAddRow} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">
                                <AddIcon fontSize="small" /> Add Row
                            </button>
                        </div>

                        <div className="overflow-auto border shadow-sm rounded-xl border-slate-200">
                            <table className="w-full text-xs min-w-[900px]">
                                {tableHead('bg-blue-700', 'Add')}
                                <tbody>
                                    {addRows.map((row, i) =>
                                        renderRow(row, i, updateAddRow, removeAddRow, addRows.length, 'add', 'Add', true)
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleAdd}
                                disabled={addLoading}
                                className="px-7 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {addLoading ? (
                                    <><svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Adding…</>
                                ) : '✅ Add'}
                            </button>
                        </div>
                    </div>
                )}

                {/* SUB TABLE */}
                {activeTab === 'sub' && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="inline-block w-1 h-4 rounded-full bg-violet-500"></span>
                                Subtract Manpower Records
                            </h2>
                            <button onClick={addSubRow} className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition">
                                <AddIcon fontSize="small" /> Add Row
                            </button>
                        </div>

                        <div className="overflow-auto border shadow-sm rounded-xl border-slate-200">
                            <table className="w-full text-xs min-w-[900px]">
                                {tableHead('bg-violet-600', 'Sub')}
                                <tbody>
                                    {subRows.map((row, i) =>
                                        renderRow(row, i, updateSubRow, removeSubRow, subRows.length, 'sub', 'Sub', false)
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleSub}
                                disabled={subLoading}
                                className="px-7 py-2.5 bg-gradient-to-r from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-violet-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {subLoading ? (
                                    <><svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Subtracting…</>
                                ) : '➖ Sub'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MasterAddition;