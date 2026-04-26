import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import api from "../../services/api";
import Button from "../../components/Button";
import { FiTrash2, FiUser, FiShield, FiPlus } from "react-icons/fi";
import { useToast } from "../../components/ToastContext";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/admin/users");
      // Res is paginated: { data: [], total: ... }
      setUsers(res.data?.data || res.data || []);
    } catch (err) {
      setError("Failed to load clinical user directory.");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This will also remove their medical/professional profile.")) return;
    
    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      addToast("User deleted successfully.", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete user.", "error");
    }
  };

  const filteredUsers = useMemo(() => {
    if (activeTab === "All") return users;
    return users.filter((user) => {
      const role = (user.role || "").toLowerCase();
      if (activeTab === "Doctors") return role === "doctor";
      if (activeTab === "Admins") return role === "admin";
      if (activeTab === "Patients") return role === "patient";
      return true;
    });
  }, [users, activeTab]);

  if (loading && users.length === 0) return <div>Retrieving user directory...</div>;

  return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>User Management</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage identities, roles, and platform access control.</p>
          </div>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: 'var(--radius-full)' }}>
            {["All", "Doctors", "Patients", "Admins"].map((tab) => (
              <button
                key={tab}
                style={{ 
                  padding: '8px 20px', 
                  borderRadius: 'var(--radius-full)', 
                  border: 'none', 
                  background: activeTab === tab ? 'white' : 'transparent',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none'
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {error && <div style={{ color: 'red', fontWeight: 700 }}>{error}</div>}

        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          {filteredUsers.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '16px 24px' }}>User Identity</th>
                  <th style={{ padding: '16px 24px' }}>Role</th>
                  <th style={{ padding: '16px 24px' }}>Member Since</th>
                  <th style={{ padding: '16px 24px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{user.name || 'Incognito User'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: 'var(--radius-full)', 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        background: user.role === 'admin' ? '#fee2e2' : user.role === 'doctor' ? '#e0f2fe' : '#f1f5f9',
                        color: user.role === 'admin' ? '#991b1b' : user.role === 'doctor' ? '#0369a1' : 'var(--text-main)'
                      }}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => deleteUser(user._id)}
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: '#ef4444', 
                            cursor: 'pointer', 
                            padding: '8px', 
                            borderRadius: 'var(--radius-sm)',
                            transition: 'var(--transition-all)'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FiUser size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
              <div>No users found in this category.</div>
            </div>
          )}
        </div>
      </div>
  );
};

export default ManageUsers;
