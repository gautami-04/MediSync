import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getUsers } from "../../services/user.service";
import styles from "./ManageUsers.module.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      setError("Failed to load users. Please try again later.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (activeTab === "All") return users;
    return users.filter((user) => {
      const role = (user.role || "").toLowerCase();
      if (activeTab === "Doctors") return role === "doctor";
      if (activeTab === "Admins") return role === "admin";
      if (activeTab === "Patients") return role === "patient" || role === "user";
      return true;
    });
  }, [users, activeTab]);

  return (
    <DashboardLayout activePath="/admin/users">
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Manage Users</h1>
          <div className={styles.tabs}>
            {["All", "Doctors", "Patients", "Admins"].map((tab) => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {error && <div style={{ color: "var(--danger-color)", marginBottom: "1rem" }}>{error}</div>}

        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loading}>Loading users...</div>
          ) : filteredUsers.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const roleClass = styles[(user.role || "patient").toLowerCase()] || styles.patient;
                  return (
                    <tr key={user._id || user.id}>
                      <td>
                        <div className={styles.userInfo}>
                          <div className={styles.avatar}>
                            {(user.name || user.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.name}>{user.name || "Unknown"}</div>
                            <div className={styles.email}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.roleBadge} ${roleClass}`}>
                          {user.role || "patient"}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "var(--success-color)", fontWeight: "600" }}>Active</span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={`${styles.btn} ${styles.editBtn}`} onClick={() => console.log('Edit', user)}>
                            Edit
                          </button>
                          <button className={`${styles.btn} ${styles.deleteBtn}`} onClick={() => console.log('Delete', user)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <h3>No users found for this category.</h3>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;
