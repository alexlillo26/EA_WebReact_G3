import React from "react";
import "./UserProfileModal.css";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  open,
  onClose,
  children,
}) => {
  if (!open) return null;

  return (
    <div
      className="profile-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="profile-modal-content">
        <button className="profile-modal-close" onClick={onClose}>
          ✖
        </button>
        {children}
      </div>
    </div>
  );
};

export default UserProfileModal;
