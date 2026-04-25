import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getDoctors } from "../../services/doctor.service";
import styles from "./DoctorSearch.module.css";

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDoctors();
      setDoctors(data || []);
    } catch (err) {
      setError("Failed to load doctors. Please try again later.");
      // Fallback empty state since API might be down in dev
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering as requested
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchName = doc.name?.toLowerCase().includes(searchName.toLowerCase()) || !searchName;
      const matchSpec = doc.specialization?.toLowerCase() === specialization.toLowerCase() || !specialization;
      const matchLoc = doc.location?.toLowerCase().includes(location.toLowerCase()) || !location;
      const matchAvail = availability ? doc.availability === (availability === "true") : true;

      return matchName && matchSpec && matchLoc && matchAvail;
    });
  }, [doctors, searchName, specialization, location, availability]);

  return (
    <DashboardLayout activePath="/find-doctors">
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Find Your Specialist</h1>
          <p className={styles.subtitle}>Book appointments with the best doctors in your area.</p>
        </header>

        <section className={styles.searchSection}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Search Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g., Dr. Smith"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Specialization</label>
            <select
              className={styles.select}
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            >
              <option value="">All Specialties</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="General Physician">General Physician</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Location</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g., New York"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Availability</label>
            <select
              className={styles.select}
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="">Any Time</option>
              <option value="true">Available Now</option>
              <option value="false">Booked</option>
            </select>
          </div>
        </section>

        {error && <div style={{ color: "var(--danger-color)", textAlign: "center", marginBottom: "1rem" }}>{error}</div>}

        <section className={styles.resultsContainer}>
          {loading ? (
            <div className={styles.resultsGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonHeader}>
                    <div className={styles.skeletonAvatar}></div>
                    <div className={styles.skeletonText}>
                      <div className={styles.skeletonLine}></div>
                      <div className={`${styles.skeletonLine} ${styles.short}`}></div>
                    </div>
                  </div>
                  <div className={styles.skeletonLine}></div>
                  <div className={styles.skeletonLine}></div>
                </div>
              ))}
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className={styles.resultsGrid}>
              {filteredDoctors.map((doc) => (
                <div key={doc._id || doc.id} className={styles.doctorCard}>
                  <div className={styles.doctorHeader}>
                    <div className={styles.avatar}>
                      {doc.name ? doc.name.charAt(0) : "D"}
                    </div>
                    <div className={styles.doctorInfo}>
                      <h3>{doc.name}</h3>
                      <p>{doc.specialization}</p>
                    </div>
                  </div>
                  <div className={styles.doctorDetails}>
                    <span>📍 {doc.location || "Location not specified"}</span>
                    <span>🗓️ {doc.availability ? "Available" : "Not Available"}</span>
                    <span>💰 {doc.consultationFee ? `₹${doc.consultationFee}` : "Standard Fee"}</span>
                  </div>
                  <button className={styles.bookButton}>Book Appointment</button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <h3>No doctors found</h3>
              <p>Try adjusting your search filters to find what you're looking for.</p>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default DoctorSearch;
