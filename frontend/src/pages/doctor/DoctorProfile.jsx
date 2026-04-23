import React, { useEffect, useState } from 'react';
import { getMyDoctorProfile } from '../../services/doctor.service';

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyDoctorProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Doctor Profile</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <strong>Name:</strong>
          <div>{profile.user?.name}</div>
        </div>
        <div>
          <strong>Email:</strong>
          <div>{profile.user?.email}</div>
        </div>
        <div>
          <strong>Specialization:</strong>
          <div>{profile.specialization}</div>
        </div>
        <div>
          <strong>Consultation Fee:</strong>
          <div>{profile.consultationFee}</div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <strong>Bio:</strong>
          <div>{profile.bio}</div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
