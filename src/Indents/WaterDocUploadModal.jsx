import React from 'react';
import { FileList } from './FileList';

const WaterDocUploadModal = ({
  show,
  onClose,
  linkDocs = [],
  setLinkDocs,
  landDocs = [],
  setLandDocs,
  othDocs = [],
  setOthDocs,
  linkLabel = "Choose file",
  showLandDocs = false,  // Set default to false
  showOthDocs = false,   // Set default to false
  title = "Upload Documents" 
}) => {
  if (!show) return null;

  const handleFilesAppend = (e, setter) => {
    if (e.target.files && e.target.files.length > 0) {
      const incoming = Array.from(e.target.files);
      setter(prev => {
        const updated = [...prev, ...incoming];
        console.log('Files updated:', updated.length);
        return updated;
      });
      e.target.value = '';
    }
  };

  const removeFile = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="custom-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="custom-modal" style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        minWidth: '500px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h5 className="mb-3" style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
          {title}
        </h5>

        {/* LINK DOC SECTION */}
        <div className="mb-4" style={{ marginBottom: '16px' }}>
          <label htmlFor="link-doc-input" className="form-label fw-semibold" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            {linkLabel}:
          </label>
          <div className="gap-2 mb-1 d-flex" style={{ marginBottom: '8px' }}>
            <input
              type="file"
              multiple
              onChange={(e) => handleFilesAppend(e, setLinkDocs)}
              id="link-doc-input"
              className="form-control"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
          <FileList 
            files={linkDocs} 
            onRemove={(i) => removeFile(setLinkDocs, i)} 
          />
        </div>

        {/* TITLE DOC SECTION */}
        {showLandDocs && (
          <div className="mb-4" style={{ marginBottom: '16px' }}>
            <label htmlFor="land-doc-input" className="form-label fw-semibold" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Title Doc:
            </label>
            <div className="gap-2 mb-1 d-flex" style={{ marginBottom: '8px' }}>
              <input
                type="file"
                multiple
                onChange={(e) => handleFilesAppend(e, setLandDocs)}
                id="land-doc-input"
                className="form-control"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <FileList 
              files={landDocs} 
              onRemove={(i) => removeFile(setLandDocs, i)} 
            />
          </div>
        )}

        {/* OTHER DOC SECTION */}
        {showOthDocs && (
          <div className="mb-4" style={{ marginBottom: '16px' }}>
            <label htmlFor="oth-doc-input" className="form-label fw-semibold" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Other Doc:
            </label>
            <div className="gap-2 mb-1 d-flex" style={{ marginBottom: '8px' }}>
              <input
                type="file"
                multiple
                onChange={(e) => handleFilesAppend(e, setOthDocs)}
                id="oth-doc-input"
                className="form-control"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <FileList 
              files={othDocs} 
              onRemove={(i) => removeFile(setOthDocs, i)} 
            />
          </div>
        )}

        <div className="gap-2 d-flex justify-content-end" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0d6efd',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaterDocUploadModal;