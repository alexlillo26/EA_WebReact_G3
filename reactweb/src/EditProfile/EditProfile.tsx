import React, { useState } from 'react';

interface EditProfileProps {
  user: { name: string } | null;
  onUpdateUser: (updatedUser: { name: string }) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name });
  };

  return (
    <div className="edit-profile">
      <h2>Editar Perfil</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default EditProfile;