import React, { useEffect, useState } from "react";
import { getUserById } from "../../services/userService";
// CAMBIO: Importamos 'Usuario' en lugar de 'IUser'
import { Usuario } from "../../models/Usuario";
import CombatHistory from "../CombatHistory/CombatHistory";
import { useLanguage } from "../../context/LanguageContext";
import "./UserProfileDetails.css";

interface UserProfileDetailsProps {
  userId: string;
}

const UserProfileDetails: React.FC<UserProfileDetailsProps> = ({ userId }) => {
  // CAMBIO: Usamos el tipo 'Usuario' para el estado
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await getUserById(userId);
        setProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return <p>{t("loading" as any)}</p>;
  }

  if (!profile) {
    return <p>{t("userProfile.loadError")}</p>;
  }

  return (
    <div className="user-profile-details">
      <h2>{profile.name}</h2>
      <div className="profile-info-grid">
        <p>
          <b>{t("emailLabel" as any)}:</b> {profile.email}
        </p>
        <p>
          <b>{t("cityLabel" as any)}:</b> {profile.city}
        </p>
        <p>
          <b>{t("weightLabel" as any)}:</b> {profile.weight}
        </p>
        <p>
          <b>{t("genderLabel" as any)}:</b>{" "}
          {t(profile.gender.toLowerCase() as any)}
        </p>
      </div>

      <div className="profile-combat-history">
        <h3>{t("combatHistory.title")}</h3>
        {userId && <CombatHistory />}
      </div>
    </div>
  );
};

export default UserProfileDetails;
