import { useEffect, useState, useMemo, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getMyAppointments, bookAppointment, cancelAppointment, rescheduleAppointment } from "../../services/appointment.service";
import { getAllDoctors } from "../../services/doctor.service";
import styles from "./Appointments.module.css";

const STATUS_CLASS = {
	booked: styles.statusBooked,
	confirmed: styles.statusConfirmed,
	completed: styles.statusCompleted,
	cancelled: styles.statusCancelled,
	rescheduled: styles.statusRescheduled,
};

const formatDate = (value) => {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);
	return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
};

import { useLocation } from "react-router-dom";
import Pagination from "../../components/Pagination";

const PatientAppointments = () => {
	const location = useLocation();
	const [appointments, setAppointments] = useState([]);
	const [totalCount, setTotalCount] = useState(0);
	const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, cancelled: 0 });
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	
	const [doctors, setDoctors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [filter, setFilter] = useState("all");
	const [showBookModal, setShowBookModal] = useState(false);
	const [showRescheduleModal, setShowRescheduleModal] = useState(false);
	const [rescheduleTarget, setRescheduleTarget] = useState(null);
	const [booking, setBooking] = useState(false);
	const [rescheduling, setRescheduling] = useState(false);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [reviewTarget, setReviewTarget] = useState(null);
	const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
	const [submittingReview, setSubmittingReview] = useState(false);
	const [formData, setFormData] = useState({ doctorId: "", date: "", time: "", reason: "" });
	const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

	// Auto-open modal if navigating from doctor search
	useEffect(() => {
		if (location.state?.doctorId) {
			setFormData(prev => ({ ...prev, doctorId: location.state.doctorId }));
			setShowBookModal(true);
		}
	}, [location.state]);

	const loadAppointments = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const data = await getMyAppointments({ 
				page: currentPage, 
				limit: itemsPerPage,
				status: filter === 'all' ? undefined : filter
			});
			setAppointments(data.appointments || []);
			setTotalCount(data.total || 0);
			setStats(data.stats || { total: 0, upcoming: 0, completed: 0, cancelled: 0 });
		} catch (err) {
			setError(err?.response?.data?.message || "Failed to load appointments.");
		} finally {
			setLoading(false);
		}
	}, [currentPage, filter]);

	// Auto-dismiss messages after 4 seconds
	useEffect(() => {
		if (error) { const t = setTimeout(() => setError(""), 4000); return () => clearTimeout(t); }
	}, [error]);
	useEffect(() => {
		if (success) { const t = setTimeout(() => setSuccess(""), 4000); return () => clearTimeout(t); }
	}, [success]);

	const loadDoctors = useCallback(async () => {
		try {
			const data = await getAllDoctors();
			setDoctors(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
		} catch {
			setDoctors([]);
		}
	}, []);

	useEffect(() => {
		loadAppointments();
		loadDoctors();
	}, [loadAppointments, loadDoctors]);

	const filteredAppointments = appointments; // Filtered by backend

	// Selected doctor preview
	const selectedDoctor = useMemo(() => {
		if (!formData.doctorId) return null;
		return doctors.find((d) => d._id === formData.doctorId) || null;
	}, [formData.doctorId, doctors]);

	const handleBook = async (e) => {
		e.preventDefault();
		setBooking(true);
		setError("");
		setSuccess("");
		try {
			await bookAppointment(formData);
			setSuccess("Appointment booked successfully! Your doctor will confirm shortly.");
			setShowBookModal(false);
			setFormData({ doctorId: "", date: "", time: "", reason: "" });
			await loadAppointments();
		} catch (err) {
			setError(err?.response?.data?.message || "Failed to book appointment.");
		} finally {
			setBooking(false);
		}
	};

	const handleCancel = async (id) => {
		if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
		setError("");
		setSuccess("");
		try {
			await cancelAppointment(id);
			setSuccess("Appointment cancelled successfully.");
			await loadAppointments();
		} catch (err) {
			setError(err?.response?.data?.message || "Failed to cancel appointment.");
		}
	};

	const openReschedule = (appt) => {
		setRescheduleTarget(appt);
		setRescheduleData({ date: appt.date || "", time: appt.time || "" });
		setShowRescheduleModal(true);
	};

	const handleReschedule = async (e) => {
		e.preventDefault();
		if (!rescheduleTarget) return;
		setRescheduling(true);
		setError("");
		setSuccess("");
		try {
			await rescheduleAppointment(rescheduleTarget._id, rescheduleData);
			setSuccess("Appointment rescheduled successfully.");
			setShowRescheduleModal(false);
			setRescheduleTarget(null);
			await loadAppointments();
		} catch (err) {
			setError(err?.response?.data?.message || "Failed to reschedule appointment.");
		} finally {
			setRescheduling(false);
		}
	};

	const getDoctorName = (appointment) => {
		if (appointment?.doctor?.user?.name) return appointment.doctor.user.name;
		if (appointment?.doctor?.name) return appointment.doctor.name;
		return "Assigned Doctor";
	};

	const getDoctorSpec = (appointment) => {
		return appointment?.doctor?.specialization || "General Consultation";
	};

	const handleReviewSubmit = async (e) => {
		e.preventDefault();
		setSubmittingReview(true);
		try {
			await api.post("/api/reviews", {
				doctorId: reviewTarget.doctor?.user?._id || reviewTarget.doctor?.user || reviewTarget.doctor,
				rating: reviewData.rating,
				comment: reviewData.comment
			});
			addToast("Review submitted successfully", "success");
			setShowReviewModal(false);
			setReviewData({ rating: 5, comment: "" });
		} catch (err) {
			addToast(err.response?.data?.message || "Failed to submit review", "error");
		} finally {
			setSubmittingReview(false);
		}
	};

	const filters = [
		{ key: "all", label: "All", count: stats.total },
		{ key: "upcoming", label: "Upcoming", count: stats.upcoming },
		{ key: "completed", label: "Completed", count: stats.completed },
		{ key: "cancelled", label: "Cancelled", count: stats.cancelled },
	];

	const canModify = (status) => ["booked", "confirmed", "rescheduled"].includes(status);

	return (
		<>
			<div className={styles.header}>
				<div>
					<h1 className={styles.headerTitle}>My Appointments</h1>
					<p className={styles.headerSubtitle}>Manage your healthcare schedule and book new visits.</p>
				</div>
				<button className={styles.btnPrimary} onClick={() => setShowBookModal(true)}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
					Book Appointment
				</button>
			</div>

			{error ? <div className={styles.errorMsg}>{error}<button className={styles.msgClose} onClick={() => setError("")}>×</button></div> : null}
			{success ? <div className={styles.successMsg}>{success}<button className={styles.msgClose} onClick={() => setSuccess("")}>×</button></div> : null}

			{/* Stats Row */}
			<div className={styles.statsRow}>
				<div className={styles.statMini}>
					<div className={styles.statMiniValue}>{stats.total}</div>
					<div className={styles.statMiniLabel}>Total</div>
				</div>
				<div className={styles.statMini}>
					<div className={styles.statMiniValue} style={{ color: "var(--brand-primary)" }}>{stats.upcoming}</div>
					<div className={styles.statMiniLabel}>Upcoming</div>
				</div>
				<div className={styles.statMini}>
					<div className={styles.statMiniValue} style={{ color: "#7b1fa2" }}>{stats.completed}</div>
					<div className={styles.statMiniLabel}>Completed</div>
				</div>
				<div className={styles.statMini}>
					<div className={styles.statMiniValue} style={{ color: "#c62828" }}>{stats.cancelled}</div>
					<div className={styles.statMiniLabel}>Cancelled</div>
				</div>
			</div>

			{/* Filter Tabs with Counts */}
			<div className={styles.filterTabs}>
				{filters.map((f) => (
					<button key={f.key} className={`${styles.filterTab} ${filter === f.key ? styles.filterTabActive : ""}`} onClick={() => setFilter(f.key)}>
						{f.label}
						<span className={styles.filterCount}>{f.count}</span>
					</button>
				))}
			</div>

			{/* Appointments List */}
			{loading ? (
				<div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Loading appointments...</div>
			) : filteredAppointments.length === 0 ? (
				<div className={styles.emptyState}>
					<div className={styles.emptyIcon}>
						<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
					</div>
					<h3 className={styles.emptyTitle}>No appointments found</h3>
					<p className={styles.emptyText}>
						{filter === "all" ? "You haven't booked any appointments yet." : `No ${filter} appointments to show.`}
					</p>
					{filter === "all" && (
						<button className={styles.btnPrimary} style={{ margin: "0 auto" }} onClick={() => setShowBookModal(true)}>Book Your First Appointment</button>
					)}
				</div>
			) : (
				<div className={styles.appointmentsList}>
					{filteredAppointments.map((appt) => (
						<div className={styles.appointmentCard} key={appt._id}>
							<div className={styles.appointmentIcon}>
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
							</div>
							<div className={styles.appointmentInfo}>
								<div className={styles.doctorName}>{getDoctorName(appt)}</div>
								<div className={styles.appointmentMeta}>
									<span>{getDoctorSpec(appt)}</span>
									{appt.consultationFee > 0 && (
										<span className={styles.feeTag}>₹{appt.consultationFee}</span>
									)}
									{appt.reason ? <span>• {appt.reason}</span> : null}
								</div>
							</div>
							<div className={styles.dateTimeBlock}>
								<div className={styles.dateText}>{formatDate(appt.date)}</div>
								<div className={styles.timeText}>{appt.time || "-"}</div>
							</div>
							<span className={`${styles.statusPill} ${STATUS_CLASS[appt.status] || styles.statusBooked}`}>
								{appt.status || "booked"}
							</span>
								<div className={styles.appointmentActions}>
									{appt.status === "booked" && (
										<>
											<button 
												className={styles.btnSecondary} 
												onClick={() => {
													setRescheduleTarget(appt);
													setRescheduleData({ date: appt.date || "", time: appt.time || "" });
													setShowRescheduleModal(true);
												}}
											>
												Reschedule
											</button>
											<button 
												className={styles.btnDanger} 
												onClick={() => handleCancel(appt._id)}
											>
												Cancel
											</button>
										</>
									)}
									{appt.status === "completed" && (
										<button 
											className={styles.btnSecondary} 
											onClick={() => {
												setReviewTarget(appt);
												setShowReviewModal(true);
											}}
										>
											Leave Review
										</button>
									)}
								</div>
						</div>
					))}
					
					{totalCount > itemsPerPage && (
						<div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
							<Pagination 
								currentPage={currentPage}
								totalPages={Math.ceil(totalCount / itemsPerPage)}
								onPageChange={setCurrentPage}
							/>
						</div>
					)}
				</div>
			)}

			{/* ======== Book Appointment Modal ======== */}
			{showBookModal && (
				<div className={styles.modalOverlay} onClick={() => setShowBookModal(false)}>
					<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
						<h2 className={styles.modalTitle}>Book New Appointment</h2>
						<p className={styles.modalSubtitle}>Select a doctor and preferred time slot.</p>
						<form onSubmit={handleBook}>
							<div className={styles.formGroup}>
								<label className={styles.formLabel}>Doctor</label>
								<select
									className={styles.formSelect}
									value={formData.doctorId}
									onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
									required
								>
									<option value="">Select a doctor...</option>
									{doctors.map((doc) => (
										<option key={doc._id} value={doc._id}>
											{doc?.user?.name || "Doctor"} — {doc.specialization} {doc.consultationFee ? `(₹${doc.consultationFee})` : ""}
										</option>
									))}
								</select>
							</div>

							{/* Doctor Preview Card with Fee */}
							{selectedDoctor && (
								<div className={styles.doctorPreview}>
									<div className={styles.doctorPreviewAvatar}>
										{(selectedDoctor?.user?.name || "D").charAt(0).toUpperCase()}
									</div>
									<div className={styles.doctorPreviewInfo}>
										<div className={styles.doctorPreviewName}>{selectedDoctor?.user?.name || "Doctor"}</div>
										<div className={styles.doctorPreviewSpec}>{selectedDoctor.specialization}</div>
										<div className={styles.doctorPreviewDetails}>
											{selectedDoctor.hospital && (
												<span className={styles.doctorPreviewTag}>
													<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
													{selectedDoctor.hospital}
												</span>
											)}
											{selectedDoctor.experienceYears > 0 && (
												<span className={styles.doctorPreviewTag}>
													<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
													{selectedDoctor.experienceYears} yrs exp
												</span>
											)}
										</div>
									</div>
									<div className={styles.doctorPreviewFee}>
										<div className={styles.doctorPreviewFeeValue}>₹{selectedDoctor.consultationFee || 0}</div>
										<div className={styles.doctorPreviewFeeLabel}>Consultation</div>
									</div>
								</div>
							)}

							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
								<div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
									<label className={styles.formLabel} style={{ marginBottom: '8px', display: 'block' }}>Doctor's Available Times</label>
									<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
										{selectedDoctor?.availableSlots?.length > 0 ? selectedDoctor.availableSlots.map((slot, i) => (
											<div key={i} style={{ background: 'white', padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
												{slot.day}: {slot.startTime} - {slot.endTime}
											</div>
										)) : <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>No slots found.</span>}
									</div>
								</div>

								<div className={styles.formGroup}>
									<label className={styles.formLabel}>Date</label>
									<input type="date" className={styles.formInput} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} min={new Date().toISOString().split("T")[0]} required />
								</div>
								<div className={styles.formGroup}>
									<label className={styles.formLabel}>Time</label>
									<input type="time" className={styles.formInput} value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
								</div>
							</div>
							<div className={styles.formGroup}>
								<label className={styles.formLabel}>Reason (Optional)</label>
								<textarea className={styles.formTextarea} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Briefly describe your reason for the visit..." />
							</div>
							<div className={styles.modalActions}>
								<button type="submit" className={styles.btnSubmit} disabled={booking}>
									{booking ? "Booking..." : selectedDoctor?.consultationFee ? `Book — ₹${selectedDoctor.consultationFee}` : "Book Appointment"}
								</button>
								<button type="button" className={styles.btnClose} onClick={() => setShowBookModal(false)}>Cancel</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* ======== Reschedule Modal ======== */}
			{showRescheduleModal && rescheduleTarget && (
				<div className={styles.modalOverlay} onClick={() => setShowRescheduleModal(false)}>
					<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
						<h2 className={styles.modalTitle}>Reschedule Appointment</h2>
						<p className={styles.modalSubtitle}>Choose a new date and time for your appointment with {getDoctorName(rescheduleTarget)}.</p>
						<form onSubmit={handleReschedule}>
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
								<div className={styles.formGroup}>
									<label className={styles.formLabel}>New Date</label>
									<input type="date" className={styles.formInput} value={rescheduleData.date} onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })} min={new Date().toISOString().split("T")[0]} required />
								</div>
								<div className={styles.formGroup}>
									<label className={styles.formLabel}>New Time</label>
									<input type="time" className={styles.formInput} value={rescheduleData.time} onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })} required />
								</div>
							</div>
							<div className={styles.modalActions}>
								<button type="submit" className={styles.btnSubmit} disabled={rescheduling}>
									{rescheduling ? "Rescheduling..." : "Confirm Reschedule"}
								</button>
								<button type="button" className={styles.btnClose} onClick={() => setShowRescheduleModal(false)}>Cancel</button>
							</div>
						</form>
					</div>
				</div>
			)}
			{/* Review Modal */}
			{showReviewModal && reviewTarget && (
				<div className={styles.modalOverlay}>
					<div className={styles.modalContent}>
						<button className={styles.modalClose} onClick={() => setShowReviewModal(false)}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
						</button>
						<h2 className={styles.modalTitle}>Rate Your Experience</h2>
						<p className={styles.modalSubtitle}>How was your appointment with {getDoctorName(reviewTarget)}?</p>
						
						<form onSubmit={handleReviewSubmit} className={styles.form}>
							<div className={styles.formGroup}>
								<label className={styles.label}>Rating (1-5)</label>
								<div style={{ display: "flex", gap: "10px", fontSize: "2rem", cursor: "pointer", justifyContent: "center", marginBottom: "20px" }}>
									{[1, 2, 3, 4, 5].map((star) => (
										<span 
											key={star} 
											onClick={() => setReviewData({ ...reviewData, rating: star })}
											style={{ color: star <= reviewData.rating ? "#f59e0b" : "#e2e8f0" }}
										>
											★
										</span>
									))}
								</div>
							</div>
							
							<div className={styles.formGroup}>
								<label className={styles.label}>Feedback (Optional)</label>
								<textarea 
									className={styles.input} 
									rows="4"
									value={reviewData.comment}
									onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
									placeholder="Tell us about your experience..."
								></textarea>
							</div>
							
							<div className={styles.modalActions}>
								<button type="button" className={styles.btnSecondary} onClick={() => setShowReviewModal(false)}>Cancel</button>
								<button type="submit" className={styles.btnPrimary} disabled={submittingReview}>
									{submittingReview ? "Submitting..." : "Submit Review"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
};

export default PatientAppointments;
