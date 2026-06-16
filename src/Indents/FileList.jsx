import React from 'react';

export const FileList = ({ files, onRemove, title }) => {
  if (!files?.length) return null;
  
  return (
    <div className="file-list-container" style={{ marginTop: '8px' }}>
      {title && (
        <div style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: '#666', 
          marginBottom: '4px' 
        }}>
          {title}:
        </div>
      )}
      <ul 
        className="list-unstyled mb-2" 
        style={{ 
          maxHeight: '120px', 
          overflowY: 'auto', 
          border: '1px solid #e0e0e0', 
          borderRadius: '4px', 
          padding: '8px',
          margin: 0,
          listStyle: 'none'
        }}
      >
        {files.map((f, i) => (
          <li 
            key={`${f.name}-${i}`} 
            style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '8px 12px',
              marginBottom: '6px'
            }}
          >
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap', 
              flex: 1, 
              fontSize: '13px',
              marginRight: '8px'
            }}>
              📄 {f.name}
            </span>
            <button
              type="button"
              onClick={() => onRemove(i)}
              style={{
                minWidth: '28px',
                height: '28px',
                padding: '0',
                fontSize: '14px',
                backgroundColor: 'transparent',
                color: '#dc3545',
                border: '1px solid #dc3545',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#dc3545';
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};