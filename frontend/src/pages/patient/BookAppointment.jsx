import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getAllDoctors, bookAppointment } from "../../services/appointment.service";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const BookAppointment = () => {
	const navigate = useNavigate();
	const [doctors, setDoctors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [selectedDoctor, setSelectedDoctor] = useState(null);
	const [form, setForm] = useState({ date: "", time: "" });
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const fetchDoctors = async () => {
			try {
				setLoading(true);
				const data = await getAllDoctors();
				const list = Array.isArray(data?.doctors) ? data.doctors : Array.isArray(data) ? data : [];
				setDoctors(list);
			} catch {
				setError("Failed to load doctors. Please try again.");
			} finally {
				setLoading(false);
			}
		};
		fetchDoctors();
	}, []);

	const handleSelect = (doctor) => {
		setSelectedDoctor(doctor);
		setForm({ date: "", time: "" });
		setError("");
		setSuccess("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!selectedDoctor) return;
		if (!form.date || !form.time) {
			setError("Please select a date and time.");
			return;
		}
		setSubmitting(true);
		setError("");
		try {
			await bookAppointment({
				doctorId: selectedDoctor.user?._id || selectedDoctor.user,
				date: form.date,
				time: form.time,
			});
			setSuccess(`Appointment booked with ${selectedDoctor.user?.name || "the doctor"} on ${form.date} at ${form.time}!`);
			setSelectedDoctor(null);
			setForm({ date: "", time: "" });
			setTimeout(() => navigate("/home"), 2500);
		} catch (err) {
			setError(err?.response?.data?.message || "Failed to book appointment. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<DashboardLayout activePath="/appointments">
			<div style={{ padding: "8px 0 32px" }}>
				<div style={{ marginBottom: "32px" }}>
					<h1 style={{ margin: "0 0 6px", fontSize: "1.8rem", fontWeight: 800, color: "var(--bg-dark)" }}>
						Book an Appointment
					</h1>
					<p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
						Choose a doctor and pick a convenient time slot.
					</p>
				</div>

				{error && (
					<div style={{ background: "#fde8e8", color: "#b91c1c", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontWeight: 600 }}>
						{error}
					</div>
				)}
				{success && (
					<div style={{ background: "#dcfce7", color: "#166534", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontWeight: 600 }}>
						✓ {success} Redirecting to dashboard...
					</div>
				)}

				<div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "28px", alignItems: "start" }}>
					{/* Doctor List */}
					<div>
						<h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
							Available Doctors
						</h2>
						{loading ? (
							<div style={{ color: "var(--text-secondary)", padding: "40px 0", textAlign: "center" }}>
								Loading doctors...
							</div>
						) : doctors.length === 0 ? (
							<div style={{ color: "var(--text-secondary)", padding: "40px 0", textAlign: "center" }}>
								No doctors found.
							</div>
						) : (
							<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
								{doctors.map((doctor) => {
									const isSelected = selectedDoctor?._id === doctor._id;
									return (
										<div
											key={doctor._id}
											onClick={() => handleSelect(doctor)}
											style={{
												background: isSelected ? "var(--brand-primary)" : "white",
												color: isSelected ? "white" : "var(--bg-dark)",
												border: `2px solid ${isSelected ? "var(--brand-primary)" : "#e5e7eb"}`,
												borderRadius: "16px",
												padding: "20px 24px",
												cursor: "pointer",
												transition: "all 0.2s",
												boxShadow: isSelected ? "0 4px 20px rgba(33,103,78,0.25)" : "0 1px 4px rgba(0,0,0,0.06)",
											}}
										>
											<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
												<div style={{
													width: "50px", height: "50px", borderRadius: "50%",
													background: isSelected ? "rgba(255,255,255,0.2)" : "var(--input-bg)",
													display: "flex", alignItems: "center", justifyContent: "center",
													fontSize: "1.3rem", fontWeight: 700, flexShrink: 0
												}}>
													{(doctor.user?.name || "D").charAt(0)}
												</div>
												<div style={{ flex: 1 }}>
													<div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "4px" }}>
														{doctor.user?.name || "Doctor"}
													</div>
													<div style={{ fontSize: "0.85rem", opacity: isSelected ? 0.85 : 0.6 }}>
														{doctor.specialization} • {doctor.hospital || "Hospital"}
													</div>
													<div style={{ fontSize: "0.8rem", marginTop: "6px", opacity: isSelected ? 0.85 : 0.55 }}>
														{doctor.experienceYears} yrs exp • ₹{doctor.consultationFee} consultation
													</div>
												</div>
												{isSelected && (
													<svg width="24" height="24" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
														<polyline points="20 6 9 17 4 12"></polyline>
													</svg>
												)}
											</div>
											{doctor.availableSlots?.length > 0 && (
												<div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
													{doctor.availableSlots.map((slot, i) => (
														<span key={i} style={{
															padding: "2px 10px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600,
															background: isSelected ? "rgba(255,255,255,0.2)" : "var(--input-bg)",
															color: isSelected ? "white" : "var(--text-secondary)"
														}}>
															{slot.day.slice(0, 3)} {slot.from}–{slot.to}
														</span>
													))}
												</div>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Booking Form */}
					<div style={{
						background: "white", borderRadius: "20px", padding: "28px",
						boxShadow: "0 2px 20px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb",
						position: "sticky", top: "20px"
					}}>
						<h2 style={{ margin: "0 0 6px", fontSize: "1.2rem", fontWeight: 800, color: "var(--bg-dark)" }}>
							Confirm Booking
						</h2>
						<p style={{ margin: "0 0 24px", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
							{selectedDoctor ? `Booking with ${selectedDoctor.user?.name || "Doctor"}` : "Select a doctor to proceed"}
						</p>

						{selectedDoctor ? (
							<form onSubmit={handleSubmit}>
								<div style={{ marginBottom: "20px" }}>
									<label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "8px", color: "var(--bg-dark)" }}>
										Appointment Date
									</label>
									<input
										type="date"
										value={form.date}
										min={new Date().toISOString().split("T")[0]}
										onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
										required
										style={{
											width: "100%", padding: "10px 14px", borderRadius: "10px",
											border: "1.5px solid #e5e7eb", fontSize: "0.95rem",
											outline: "none", fontFamily: "inherit", boxSizing: "border-box"
										}}
									/>
								</div>

								<div style={{ marginBottom: "28px" }}>
									<label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "8px", color: "var(--bg-dark)" }}>
										Preferred Time
									</label>
									<select
										value={form.time}
										onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
										required
										style={{
											width: "100%", padding: "10px 14px", borderRadius: "10px",
											border: "1.5px solid #e5e7eb", fontSize: "0.95rem",
											outline: "none", fontFamily: "inherit", background: "white", boxSizing: "border-box"
										}}
									>
										<option value="">Select a time</option>
										{["09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
											"14:00", "14:30", "15:00", "15:30", "16:00", "16:30"].map(t => (
											<option key={t} value={t}>{t}</option>
										))}
									</select>
								</div>

								{/* Summary */}
								<div style={{ background: "var(--input-bg)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
									<div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Booking Summary</div>
									<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.88rem" }}>
										<span style={{ color: "var(--text-secondary)" }}>Doctor</span>
										<span style={{ fontWeight: 600 }}>{selectedDoctor.user?.name || "—"}</span>
									</div>
									<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.88rem" }}>
										<span style={{ color: "var(--text-secondary)" }}>Specialty</span>
										<span style={{ fontWeight: 600 }}>{selectedDoctor.specialization}</span>
									</div>
									<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.88rem" }}>
										<span style={{ color: "var(--text-secondary)" }}>Consultation Fee</span>
										<span style={{ fontWeight: 700, color: "var(--brand-primary)" }}>₹{selectedDoctor.consultationFee}</span>
									</div>
								</div>

								<button
									type="submit"
									disabled={submitting}
									style={{
										width: "100%", padding: "13px", borderRadius: "12px",
										background: submitting ? "#94a3b8" : "var(--brand-primary)",
										color: "white", fontWeight: 700, fontSize: "1rem",
										border: "none", cursor: submitting ? "not-allowed" : "pointer",
										transition: "background 0.2s"
									}}
								>
									{submitting ? "Booking..." : "Confirm Appointment"}
								</button>
							</form>
						) : (
							<div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
								<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: "12px", opacity: 0.3 }}>
									<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
									<line x1="16" y1="2" x2="16" y2="6"></line>
									<line x1="8" y1="2" x2="8" y2="6"></line>
									<line x1="3" y1="10" x2="21" y2="10"></line>
								</svg>
								<p style={{ fontSize: "0.9rem" }}>Select a doctor from the list to book an appointment.</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default BookAppointment;
