import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from "../Config";

/* Parse first sheet of xlsx → { headers, rows } */
const parseExcel = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const [headers = [], ...rows] = json;
        resolve({ headers, rows });
      } catch {
        reject(new Error('Could not parse Excel file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });

const FileUpload = () => {
  const [userToken] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  // const [plantCode, setPlantCode] = useState('');
  const [uploadDate, setUploadDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [plantOptions, setPlantOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://192.168.8.91:8084/inactive/phpapi/plant_api.php')
      .then((res) => setPlantOptions(res.data))
      .catch((err) => console.error('Failed to fetch plant data', err));
  }, []);

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    // if (!plantCode.trim()) e.plantCode = 'Please select a Plant Code.';
    if (!uploadDate) e.uploadDate = 'Please select an Upload Date.';
    if (!file) e.file = 'Please select an Excel file.';
    else if (!/\.(xlsx|xls)$/i.test(file.name)) e.file = 'Only .xlsx or .xls files are accepted.';
    return e;
  };

  /* ── File handlers ── */
  const applyFile = (f) => {
    if (!f) return;
    setFile(f);
    setErrors((prev) => ({ ...prev, file: undefined }));
  };
  const handleFileChange = (e) => applyFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    applyFile(e.dataTransfer.files[0]);
  };

  /* ── Submit → show preview ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      const parsed = await parseExcel(file);
      setPreview(parsed);
    } catch {
      setErrors({ file: 'Could not read the Excel file. Please check and try again.' });
    }
  };

  /* ── Confirmed upload ── */
  const handleConfirmUpload = async () => {
    setPreview(null);
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('UploadDate', uploadDate);

    try {
      const response = await fetch(`${API_BASE_URL}manpower-upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken.token}` },
        body: formData,
      });

      const data = await response.json();

      // ✅ Handle validation error (422) — show invalid rows in a table
      if (response.status === 422 && data.invalid_rows) {
        setIsUploading(false);

        const rowsHtml = `
        <div style="max-height:300px; overflow-y:auto; margin-top:8px;">
            <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
                <thead>
                    <tr style="background:#1e40af; color:#fff;">
                        <th style="padding:6px 10px;">Row #</th>
                        <th style="padding:6px 10px;">PLANT</th>
                        <th style="padding:6px 10px;">CODES</th>
                        <th style="padding:6px 10px;">SUB_CODES</th>
                        <th style="padding:6px 10px;">Reason</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.invalid_rows.map((r, i) => `
                        <tr style="background:${i % 2 === 0 ? '#eff6ff' : '#fff'};">
                            <td style="padding:5px 10px; border-bottom:1px solid #dbeafe;">${r.row}</td>
                            <td style="padding:5px 10px; border-bottom:1px solid #dbeafe;">${r.PLANT}</td>
                            <td style="padding:5px 10px; border-bottom:1px solid #dbeafe;">${r.CODES}</td>
                            <td style="padding:5px 10px; border-bottom:1px solid #dbeafe;">${r.SUB_CODES}</td>
                            <td style="padding:5px 10px; border-bottom:1px solid #dbeafe; color:#dc2626; font-weight:600;">${r.reason}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </div>`;

        await Swal.fire({
          title: '⚠️ Validation Failed',
          html: `<p style="font-size:13px; color:#374151;">${data.error}</p>${rowsHtml}`,
          icon: 'error',
          width: 650,
          confirmButtonText: 'OK, Fix & Re-upload',
          confirmButtonColor: '#dc2626',
        });
        return;
      }

      if (!response.ok) throw new Error(data.error || 'Unknown error');
      await Swal.fire({
        title: 'Success!',
        text: 'File uploaded successfully!',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb',
      });
      // ✅ Reset form so page is clean for a new upload
      setFile(null);
      setUploadDate(new Date().toISOString().split('T')[0]);
      setErrors({});
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // navigate('/ManpowerUploadForm');
      // navigate('/ManpowerUploadList');

    } catch (err) {
      setIsUploading(false);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to upload file',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  return (
    <div className="max-w-sm p-6 mx-auto mt-10 transition-shadow duration-300 bg-white border border-blue-300 shadow-lg rounded-2xl hover:shadow-2xl">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <img src="./mrflogo.png" alt="Logo" className="object-contain h-10 w-14" />
          <h2 className="text-lg font-extrabold tracking-wide text-blue-700 drop-shadow-sm">
            Manpower Upload
          </h2>
        </div>
        <ArrowBackIcon
          className="text-blue-600 transition-colors cursor-pointer hover:text-blue-800"
          onClick={() => navigate('/dashboard')}
          fontSize="medium"
          titleAccess="Go Back"
        />
      </div>

      <hr className="mb-4 border-t-4 border-blue-600 rounded" />
      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3">

        {/* Plant Code */}
        {/* <div>
          <label className="block mb-1 text-xs font-semibold text-gray-700">
            Plant Code <span className="text-red-500">*</span>
          </label>
          <select
            value={plantCode}
            onChange={(e) => { setPlantCode(e.target.value); setErrors((p) => ({ ...p, plantCode: undefined })); }}
            className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white text-gray-900 text-sm ${errors.plantCode ? 'border-red-400 bg-red-50' : 'border-blue-300'}`}
          >
            <option value="">— Select Plant —</option>
            {plantOptions.map((plant, idx) => (
              <option key={idx} value={plant.PLANT}>{plant.PLANT_NAME}</option>
            ))}
          </select>
          {errors.plantCode && (
            <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
              <span>⚠</span> {errors.plantCode}
            </p>
          )}
        </div> */}

        {/* Upload Date */}
        <div>
          <label className="block mb-1 text-xs font-semibold text-gray-700">
            Upload Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={uploadDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => { setUploadDate(e.target.value); setErrors((p) => ({ ...p, uploadDate: undefined })); }}
            className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white text-gray-900 text-sm ${errors.uploadDate ? 'border-red-400 bg-red-50' : 'border-blue-300'}`}
          />
          {errors.uploadDate && (
            <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
              <span>⚠</span> {errors.uploadDate}
            </p>
          )}
        </div>

        {/* Excel File — Drag & Drop */}
        <div>
          <label className="block mb-1 text-xs font-semibold text-gray-700">
            Excel File <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`w-full border-2 border-dashed rounded-xl px-4 py-4 text-center cursor-pointer transition duration-200 ${errors.file
              ? 'border-red-400 bg-red-50'
              : file
                ? 'border-green-400 bg-green-50'
                : isDragging
                  ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                  : 'border-blue-300 bg-white hover:bg-blue-50'
              }`}
          >
            <div className="text-xl mb-0.5">{file ? '✅' : '📂'}</div>
            {file ? (
              <>
                <p className="text-xs font-semibold text-green-600">File selected</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  📄 {file.name}
                </span>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-blue-600">Drag & drop or click to browse</p>
                <p className="text-xs text-gray-400 mt-0.5">Accepted: .xlsx, .xls</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>
          {errors.file && (
            <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
              <span>⚠</span> {errors.file}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-center pt-1">
          <button
            type="submit"
            disabled={isUploading}
            className={`px-7 py-2.5 bg-gradient-to-r text-white rounded-full font-semibold text-sm shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300 ${isUploading
              ? 'from-gray-400 to-gray-600 cursor-not-allowed'
              : 'from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
              }`}
          >
            {isUploading ? '⏳ Uploading…' : '📤 Preview & Upload'}
          </button>
        </div>
      </form>

      {/* ══════════════ PREVIEW MODAL ══════════════ */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setPreview(null)}
        >
          <div className="flex flex-col w-full max-w-4xl overflow-hidden bg-white border border-blue-200 shadow-2xl rounded-2xl"
            style={{ maxHeight: '80vh' }}>

            {/* Modal Header */}
            <div className="flex items-center justify-between flex-shrink-0 px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-500">
              <div>
                <p className="text-sm font-bold text-white">📊 Preview — {file.name}</p>
                <p className="text-blue-200 text-xs mt-0.5">
                  {preview.rows.length} row{preview.rows.length !== 1 ? 's' : ''} · {preview.headers.length} column{preview.headers.length !== 1 ? 's' : ''}
                  &nbsp;·&nbsp; Date: <b>{uploadDate}</b>
                  {/* &nbsp;·&nbsp; Plant: <b>{plantCode}</b> · Date: <b>{uploadDate}</b> */}
                </p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="text-white bg-white/20 hover:bg-white/30 rounded-lg px-2.5 py-1 text-sm font-bold transition"
              >✕</button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {preview.headers.length === 0 ? (
                <p className="p-6 text-sm text-center text-gray-400">No data found in the file.</p>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky top-0 w-8 px-3 py-2 font-bold tracking-wider text-left text-white uppercase bg-blue-800">#</th>
                      {preview.headers.map((h, i) => (
                        <th key={i} className="sticky top-0 px-3 py-2 font-bold tracking-wider text-left text-white uppercase bg-blue-800 whitespace-nowrap">
                          {String(h ?? '')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 100).map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                        <td className="px-3 py-1.5 border-b border-blue-100 text-gray-500">{ri + 1}</td>
                        {preview.headers.map((_, ci) => (
                          <td key={ci} className="px-3 py-1.5 border-b border-blue-100 text-gray-700 whitespace-nowrap">
                            {String(row[ci] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {preview.rows.length > 100 && (
                <p className="py-2 text-xs text-center text-gray-400">
                  Showing first 100 of {preview.rows.length} rows.
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between flex-shrink-0 px-6 py-3 border-t border-blue-100 bg-gray-50">
              <p className="text-xs text-gray-500">Review the data above before confirming.</p>
              <button
                onClick={handleConfirmUpload}
                className="px-6 py-2 text-sm font-bold text-white transition rounded-full shadow bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
              >
                ✅ Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
