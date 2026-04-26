import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";
import styles from "./DoctorSearch.module.css";
import Button from "../../components/Button";
import { FiSearch, FiMapPin, FiCalendar, FiDollarSign, FiHeart } from "react-icons/fi";
import { useToast } from "../../components/ToastContext";

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [savedDoctorIds, setSavedDoctorIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    fetchDoctors();
    fetchSavedDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/doctors');
      setDoctors(res.data || []);
    } catch (err) {
      setError("Failed to load medical registry.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedDoctors = async () => {
    try {
      const res = await api.get('/api/patients/saved-doctors');
      const ids = new Set((res.data || []).map(d => d._id));
      setSavedDoctorIds(ids);
    } catch (err) {
      console.error("Failed to fetch favorites");
    }
  };

  const toggleFavorite = async (doctorId) => {
    try {
      if (savedDoctorIds.has(doctorId)) {
        await api.delete(`/api/patients/saved-doctors/${doctorId}`);
        setSavedDoctorIds(prev => {
          const next = new Set(prev);
          next.delete(doctorId);
          return next;
        });
        addToast("Removed from favorites", "info");
      } else {
        await api.post(`/api/patients/saved-doctors/${doctorId}`);
        setSavedDoctorIds(prev => {
          const next = new Set(prev);
          next.add(doctorId);
          return next;
        });
        addToast("Added to favorites", "success");
      }
    } catch (err) {
      addToast("Failed to update favorites", "error");
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const name = doc.user?.name || doc.name || "";
      const matchName = name.toLowerCase().includes(searchName.toLowerCase()) || !searchName;
      const matchSpec = doc.specialization?.toLowerCase().includes(specialization.toLowerCase()) || !specialization;
      return matchName && matchSpec;
    });
  }, [doctors, searchName, specialization]);

  const handleBook = (doctorId) => {
    navigate('/book-appointment', { state: { doctorId } });
  };

  return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Find Your Specialist</h1>
          <p className={styles.subtitle}>Book appointments with the best practitioners in the network.</p>
        </header>

        <section className={styles.searchSection} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'white', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
          <div className={styles.inputGroup}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Search by Name</label>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: '#f8fafc' }}
                placeholder="e.g. Dr. Jovab"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Specialization</label>
            <input
              type="text"
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: '#f8fafc' }}
              placeholder="e.g. Cardiology"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
          </div>
        </section>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>Accessing directory...</div>
        ) : filteredDoctors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredDoctors.map((doc) => (
              <div key={doc._id} style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                <button 
                  onClick={() => toggleFavorite(doc._id)}
                  style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: savedDoctorIds.has(doc._id) ? '#ef4444' : '#cbd5e1' }}
                >
                  <FiHeart size={24} style={{ fill: savedDoctorIds.has(doc._id) ? '#ef4444' : 'none' }} />
                </button>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800 }}>
                    {(doc.user?.name || doc.name || 'D').charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 800 }}>{doc.user?.name || doc.name}</h3>
                    <p style={{ margin: '2px 0 0', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>{doc.specialization}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiMapPin /> {doc.hospital || "Clinical Facility"}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiDollarSign /> {doc.consultationFee ? `₹${doc.consultationFee}` : "Standard Consultation"}
                  </div>
                </div>

                <Button style={{ marginTop: '8px' }} onClick={() => handleBook(doc._id)}>Book Appointment</Button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <h3>No practitioners found matching your criteria.</h3>
          </div>
        )}
      </div>
  );
};

export default DoctorSearch;
