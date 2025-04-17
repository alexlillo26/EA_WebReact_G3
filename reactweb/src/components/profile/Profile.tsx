import React from 'react';

interface ProfileProps {
  user: { name: string } | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => (
  <div className="profile-container">
    <h2>Mis Datos</h2>
    {user ? (
      <p>Nombre: {user.name}</p>
    ) : (
      <p>No has iniciado sesión.</p>
    )}
  </div>
);

export default Profile;