import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../services/api';
import { FiFileText, FiCalendar, FiUser, FiDownload, FiX, FiUpload } from 'react-icons/fi';
import { useToast } from '../../components/ToastContext';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', notes: '', file: null });
  const { addToast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/medicalRecords/my');
      setRecords(res.data?.data || res.data || []);
    } catch (err) {
      setError("Unable to retrieve medical history.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Medical History</h1>
            <p style={{ color: 'var(--text-muted)' }}>Secure access to your clinical records, diagnoses, and prescriptions.</p>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            style={{ 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: 700, 
              cursor: 'pointer' 
            }}
          >
            + Upload New Record
          </button>
        </header>

        {error && <div style={{ color: 'red', fontWeight: 600 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Accessing clinical vault...</div>
          ) : records.length > 0 ? (
            records.map((record) => (
              <div key={record._id} style={{ 
                background: 'white', 
                padding: '24px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'var(--transition-all)'
              }}
              className="record-card"
              >
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: 'var(--primary-light)', 
                    color: 'var(--primary)', 
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FiFileText size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700 }}>{record.title}</h3>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiCalendar size={14} /> {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiUser size={14} /> {record.doctor?.user?.name || 'Dr. Practitioner'}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => window.open(`http://localhost:5000${record.fileUrl}`, '_blank')}
                  style={{ 
                  background: '#f1f5f9', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: 'var(--radius-sm)', 
                  fontWeight: 700, 
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiDownload /> View Details
                </button>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: '80px', 
              textAlign: 'center', 
              background: 'white', 
              borderRadius: 'var(--radius-md)', 
              border: '1px dotted var(--border-color)',
              color: 'var(--text-muted)'
            }}>
              <FiFileText size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
              <p>No medical records found in your profile.</p>
            </div>
          )}
        </div>

        {showUploadModal && (
          <div style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{ 
              background: 'white', 
              padding: '32px', 
              borderRadius: 'var(--radius-lg)', 
              width: '100%', 
              maxWIdth: '500px',
              boxShadow: 'var(--shadow-xl)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Upload Medical Record</h2>
                <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={24} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>RECORD TITLE</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Annual Blood Report 2024"
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    value={uploadData.title}
                    onChange={e => setUploadData({...uploadData, title: e.target.value})}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>CLINICAL NOTES (OPTIONAL)</label>
                  <textarea 
                    placeholder="Any additional context..."
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', height: '100px' }}
                    value={uploadData.notes}
                    onChange={e => setUploadData({...uploadData, notes: e.target.value})}
                  />
                </div>

                <div style={{ 
                  border: '2px dashed var(--border-color)', 
                  padding: '32px', 
                  borderRadius: 'var(--radius-md)', 
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('file-input').click()}
                >
                  <FiUpload size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>{uploadData.file ? uploadData.file.name : 'Click to select PNG, JPEG or PDF'}</p>
                  <input 
                    id="file-input"
                    type="file" 
                    accept=".png,.jpg,.jpeg,.pdf"
                    style={{ display: 'none' }}
                    onChange={e => setUploadData({...uploadData, file: e.target.files[0]})}
                  />
                </div>

                <button 
                  disabled={uploading || !uploadData.file || !uploadData.title}
                  onClick={async () => {
                    setUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append('file', uploadData.file);
                      fd.append('title', uploadData.title);
                      fd.append('notes', uploadData.notes);
                      await api.post('/api/medicalRecords/upload', fd);
                      addToast('Record uploaded successfully', 'success');
                      setShowUploadModal(false);
                      setUploadData({ title: '', notes: '', file: null });
                      fetchRecords();
                    } catch (err) {
                      addToast(err.response?.data?.message || 'Upload failed', 'error');
                    } finally {
                      setUploading(false);
                    }
                  }}
                  style={{ 
                    background: 'var(--primary)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '14px', 
                    borderRadius: 'var(--radius-md)', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    opacity: (uploading || !uploadData.file || !uploadData.title) ? 0.6 : 1
                  }}
                >
                  {uploading ? 'Uploading...' : 'Confirm Upload'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default MedicalRecords;
